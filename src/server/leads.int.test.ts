import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { LEAD_LIMITS } from "@/domain/leads";
import { getOrCreateRoom } from "./conversations";
import { leadCaptured, saveLead, sendLeadNotice } from "./leads";

// Integration test (spec 005): needs a migrated Postgres in TEST_DATABASE_URL.
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("lead capture", () => {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  const clerkId = "user_int_test_leads";
  let siteId: string;
  let questionId: string;
  const visitor = () => crypto.randomUUID();

  beforeEach(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    const user = await db.user.create({
      data: {
        clerkId,
        fullname: "Dueña",
        domains: {
          create: {
            name: "leads-int.com.ar",
            icon: "",
            chatBot: { create: {} },
            filterQuestions: { create: { question: "¿Qué estás buscando?" } },
          },
        },
      },
      include: { domains: { include: { filterQuestions: true } } },
    });
    siteId = user.domains[0].id;
    questionId = user.domains[0].filterQuestions[0].id;
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    await db.$disconnect();
  });

  const submit = (visitorId: string, input: unknown) => saveLead(db, { domainId: siteId, visitorId, input });
  const customer = (visitorId: string) =>
    db.customer.findUniqueOrThrow({
      where: { domainId_visitorId: { domainId: siteId, visitorId } },
      include: { questions: true, leadSubmissions: true },
    });

  it("stores the email, the answers with their question and the consent, and asks to notify the owner", async () => {
    const v = visitor();
    await getOrCreateRoom(db, { domainId: siteId, visitorId: v });
    const result = await submit(v, { email: "Ana@Example.com", answers: [{ questionId, answer: "Tortas" }] });

    expect(result).toEqual({
      ok: true,
      email: "ana@example.com",
      notice: {
        ownerClerkId: clerkId,
        siteName: "leads-int.com.ar",
        email: "ana@example.com",
        responses: [{ question: "¿Qué estás buscando?", answered: "Tortas" }],
      },
    });
    const lead = await customer(v);
    expect(lead).toMatchObject({ email: "ana@example.com" });
    expect(lead.leadAt).toBeInstanceOf(Date);
    expect(lead.consentAt).toBeInstanceOf(Date);
    expect(lead.questions).toMatchObject([{ question: "¿Qué estás buscando?", answered: "Tortas" }]);
    expect(await leadCaptured(db, siteId, v)).toBe(true);
  });

  it("updates a returning lead without duplicating it or emailing again", async () => {
    const v = visitor();
    await submit(v, { email: "ana@example.com", answers: [{ questionId, answer: "Tortas" }] });
    const firstLeadAt = (await customer(v)).leadAt;

    const again = await submit(v, { email: "ana.perez@example.com", answers: [{ questionId, answer: "Pan" }] });
    expect(again).toMatchObject({ ok: true, notice: null });

    const lead = await customer(v);
    expect(lead.email).toBe("ana.perez@example.com");
    expect(lead.leadAt).toEqual(firstLeadAt);
    expect(lead.questions.map((q) => q.answered)).toEqual(["Pan"]);
    expect(await db.customer.count({ where: { domainId: siteId, leadAt: { not: null } } })).toBe(1);
  });

  it("emails only one of two simultaneous first submissions", async () => {
    const v = visitor();
    const results = await Promise.all([
      submit(v, { email: "ana@example.com" }),
      submit(v, { email: "ana@example.com" }),
    ]);
    expect(results.filter((r) => r.ok && r.notice)).toHaveLength(1);
  });

  it("rejects invalid data and questions from another site without storing anything", async () => {
    const v = visitor();
    expect(await submit(v, { email: "no-es-un-email" })).toMatchObject({ ok: false, status: 400 });
    expect(
      await submit(v, { email: "ana@example.com", answers: [{ questionId: crypto.randomUUID(), answer: "x" }] }),
    ).toMatchObject({ ok: false, status: 400 });
    expect(await leadCaptured(db, siteId, v)).toBe(false);
  });

  it("rejects submissions when the owner turned lead capture off", async () => {
    await db.chatBot.update({ where: { domainId: siteId }, data: { leadCapture: false } });
    expect(await submit(visitor(), { email: "ana@example.com" })).toMatchObject({ ok: false, status: 404 });
  });

  it("does not email when the owner turned notifications off", async () => {
    await db.chatBot.update({ where: { domainId: siteId }, data: { leadEmail: false } });
    expect(await submit(visitor(), { email: "ana@example.com" })).toMatchObject({ ok: true, notice: null });
  });

  it("limits each visitor to 5 submissions every 10 minutes", async () => {
    const v = visitor();
    for (let i = 0; i < LEAD_LIMITS.visitor.submissions; i++) {
      expect((await submit(v, { email: `ana${i}@example.com` })).ok).toBe(true);
    }
    expect(await submit(v, { email: "otra@example.com" })).toMatchObject({ ok: false, status: 429 });
    expect((await customer(v)).email).toBe(`ana${LEAD_LIMITS.visitor.submissions - 1}@example.com`);
  });

  it("stores leads over the site's daily email cap without emailing", async () => {
    const seeded = await db.customer.create({ data: { domainId: siteId, visitorId: visitor() } });
    await db.leadSubmission.createMany({
      data: Array.from({ length: LEAD_LIMITS.siteEmails.emails }, () => ({ customerId: seeded.id, notified: true })),
    });
    const v = visitor();
    expect(await submit(v, { email: "ana@example.com" })).toMatchObject({ ok: true, notice: null });
    expect((await customer(v)).leadAt).toBeInstanceOf(Date);
  });

  describe("sendLeadNotice", () => {
    const notice = {
      ownerClerkId: clerkId,
      siteName: "leads-int.com.ar",
      email: "ana@example.com",
      responses: [],
    };

    it("emails the owner with the lead, replying to the visitor", async () => {
      const send = vi.fn().mockResolvedValue(undefined);
      const sent = await sendLeadNotice(notice, {
        sender: { send },
        ownerEmail: async () => "duena@example.com",
        appUrl: "https://app.brainance.com",
      });
      expect(sent).toBe(true);
      expect(send).toHaveBeenCalledWith(
        expect.objectContaining({ to: "duena@example.com", replyTo: "ana@example.com", subject: expect.stringContaining("ana@example.com") }),
      );
      expect(send.mock.calls[0][0].text).toContain("https://app.brainance.com/leads");
    });

    it("does not throw when the provider fails or the owner has no email", async () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      const failing = { send: vi.fn().mockRejectedValue(new Error("403")) };
      const deps = { sender: failing, ownerEmail: async () => "duena@example.com", appUrl: "https://x" };
      await expect(sendLeadNotice(notice, deps)).resolves.toBe(false);
      await expect(sendLeadNotice(notice, { ...deps, ownerEmail: async () => null })).resolves.toBe(false);
      error.mockRestore();
    });
  });
});
