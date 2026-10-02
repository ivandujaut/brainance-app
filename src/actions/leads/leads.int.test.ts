import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// Spec 005: the owner lists, exports and deletes their leads. Isolation between tenants is covered
// in src/actions/tenant-isolation.int.test.ts.
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

const OWNER = "user_int_leads_actions";
vi.mock("@clerk/nextjs/server", () => ({ currentUser: async () => ({ id: OWNER }), clerkClient: async () => ({}) }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

describe.skipIf(!url)("lead actions", async () => {
  const { client: db } = await import("@/lib/prisma");
  const leads = await import(".");
  const bot = await import("../settings/bot");
  let panaderia: string;
  let taller: string;

  const lead = (domainId: string, email: string, leadAt: Date, answered?: string) =>
    db.customer.create({
      data: {
        domainId,
        visitorId: crypto.randomUUID(),
        email,
        leadAt,
        consentAt: leadAt,
        questions: answered ? { create: { question: "¿Qué buscás?", answered } } : undefined,
        chatRoom: { create: { message: { create: { message: "hola", role: "user" } } } },
      },
    });

  beforeEach(async () => {
    await db.user.deleteMany({ where: { clerkId: OWNER } });
    const owner = await db.user.create({
      data: {
        clerkId: OWNER,
        fullname: "Dueña",
        domains: {
          create: [
            { name: "panaderia.com.ar", icon: "", chatBot: { create: {} } },
            { name: "taller.com.ar", icon: "", chatBot: { create: {} } },
          ],
        },
      },
      include: { domains: { orderBy: { name: "asc" } } },
    });
    [panaderia, taller] = owner.domains.map((d) => d.id);
    await lead(panaderia, "ana@example.com", new Date("2026-10-01T10:00:00Z"), "=Tortas");
    await lead(taller, "beto@example.com", new Date("2026-10-02T10:00:00Z"));
    // A visitor who chatted but never left their data is not a lead.
    await db.customer.create({ data: { domainId: panaderia, visitorId: crypto.randomUUID() } });
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId: OWNER } });
    await db.$disconnect();
  });

  it("lists the leads of all the owner's sites, newest first", async () => {
    const result = await leads.onListLeads();
    expect(result.map((l) => [l.email, l.site])).toEqual([
      ["beto@example.com", "taller.com.ar"],
      ["ana@example.com", "panaderia.com.ar"],
    ]);
    expect(result[1].responses).toEqual([{ question: "¿Qué buscás?", answered: "=Tortas" }]);
  });

  it("filters by site", async () => {
    expect((await leads.onListLeads(panaderia)).map((l) => l.email)).toEqual(["ana@example.com"]);
  });

  it("exports the same leads as CSV, with formulas neutralized", async () => {
    const csv = await leads.onExportLeads(panaderia);
    expect(csv).toContain("ana@example.com,panaderia.com.ar,");
    expect(csv).toContain("¿Qué buscás? =Tortas");
    expect(csv).not.toContain("beto@example.com");
  });

  it("deletes a lead's personal data but keeps the conversation", async () => {
    const [ana] = await leads.onListLeads(panaderia);
    expect((await leads.onDeleteLead(ana.id)).status).toBe(200);
    expect(await leads.onListLeads(panaderia)).toEqual([]);
    const customer = await db.customer.findUniqueOrThrow({
      where: { id: ana.id },
      include: { questions: true, chatRoom: { include: { message: true } } },
    });
    expect(customer).toMatchObject({ email: null, leadAt: null, consentAt: null, questions: [] });
    expect(customer.chatRoom[0].message).toHaveLength(1);
  });

  it("onUpdateLeadSettings: turns lead capture and its email on and off", async () => {
    expect((await bot.onUpdateLeadSettings(panaderia, { leadCapture: false, leadEmail: false })).status).toBe(200);
    expect(await db.chatBot.findUniqueOrThrow({ where: { domainId: panaderia } })).toMatchObject({
      leadCapture: false,
      leadEmail: false,
    });
    expect((await bot.onUpdateLeadSettings(panaderia, { leadCapture: "sí" })).status).toBe(400);
  });
});
