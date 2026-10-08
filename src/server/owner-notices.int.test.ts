import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import type { Email, EmailSender } from "./email";
import { addMessage, getOrCreateRoom } from "./conversations";
import { flagAttention, markAttended, takeOver } from "./live";
import { notifyAttention } from "./owner-notices";

// Integration test (spec 010): needs a migrated Postgres in TEST_DATABASE_URL.
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("owner notices", () => {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  const clerkId = "user_int_test_notices";
  let siteId: string;
  const sent: Email[] = [];
  const sender: EmailSender = { send: async (email) => void sent.push(email) };
  const deps = { sender, ownerEmail: async () => "duena@example.com", appUrl: "https://app.example" };

  beforeEach(async () => {
    sent.length = 0;
    await db.user.deleteMany({ where: { clerkId } });
    const user = await db.user.create({
      data: {
        clerkId,
        fullname: "Dueña",
        domains: { create: { name: "notices-int.com.ar", icon: "", chatBot: { create: {} } } },
      },
      include: { domains: true },
    });
    siteId = user.domains[0].id;
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    await db.$disconnect();
  });

  const room = async () => {
    const id = await getOrCreateRoom(db, { domainId: siteId, visitorId: crypto.randomUUID() });
    await addMessage(db, id, "user", "¿Tienen sin TACC?");
    await addMessage(db, id, "assistant", "No tengo ese dato. Escribinos por WhatsApp +54 9 341 555-0101.");
    return id;
  };
  const state = (id: string) =>
    db.chatRoom.findUniqueOrThrow({
      where: { id },
      select: { needsAttention: true, attentionAt: true, attentionNotifiedAt: true, attentionNotices: true },
    });
  const flagAndNotify = async (
    id: string,
    reason: "derivation" | "human_request" | "site_cap" | "model_error" = "derivation",
    now = new Date(),
  ) =>
    notifyAttention(
      db,
      { roomId: id, domainId: siteId, reason, flagged: await flagAttention(db, id, reason), now },
      deps,
    );

  it("emails the owner once per episode, with the exchanges and a link to the conversation (criteria 1, 7, 13)", async () => {
    const id = await room();
    expect(await flagAndNotify(id)).toBe("notify");
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("duena@example.com");
    expect(sent[0].subject).toBe("Un cliente de notices-int.com.ar espera tu respuesta");
    expect(sent[0].text).toContain("Visitante: ¿Tienen sin TACC?");
    expect(sent[0].text).toContain(`https://app.example/conversations?c=${id}`);
    const after = await state(id);
    expect(after.attentionAt).not.toBeNull();
    expect(after.attentionNotifiedAt).not.toBeNull();
    expect(after.attentionNotices).toBe(1);

    // The same episode: the visitor writes again right away and the bot derives again.
    expect(await flagAndNotify(id)).toBe("skip:already_notified");
    expect(sent).toHaveLength(1);
  });

  it("reminds once when the visitor writes 30 minutes later, then stays quiet (criterion 2)", async () => {
    const id = await room();
    const t0 = new Date("2026-10-07T03:00:00Z");
    await flagAndNotify(id, "derivation", t0);
    expect(await flagAndNotify(id, "derivation", new Date(t0.getTime() + 31 * 60_000))).toBe("remind");
    expect(sent).toHaveLength(2);
    expect(sent[1].subject).toContain("sigue esperando");
    expect(await flagAndNotify(id, "derivation", new Date(t0.getTime() + 120 * 60_000))).toBe("skip:already_reminded");
    expect(sent).toHaveLength(2);
    expect((await state(id)).attentionNotices).toBe(2);
  });

  it("starts a new episode after the owner took over (criteria 1, 14)", async () => {
    const id = await room();
    await flagAndNotify(id);
    await takeOver(db, id, "notices-int.com.ar");
    expect((await state(id)).needsAttention).toBe(false);
    // The owner released the room (or the bot got it back) and the bot derives again later.
    await db.chatRoom.update({ where: { id }, data: { liveSince: null } });
    expect(await flagAndNotify(id)).toBe("notify");
    expect(sent).toHaveLength(2);
    expect((await state(id)).attentionNotices).toBe(1);
  });

  // Spec 012, criterion 6: after the owner marked it as attended, a new flag is a new episode.
  it("notifies again when the bot derives after the conversation was marked as attended", async () => {
    const id = await room();
    expect(await flagAndNotify(id)).toBe("notify");
    await markAttended(db, id);
    expect(await flagAndNotify(id)).toBe("notify");
    expect(sent).toHaveLength(2);
    expect((await state(id)).attentionNotices).toBe(1);
  });

  it("stays quiet while the owner is live in the conversation (criterion 3)", async () => {
    const id = await room();
    await takeOver(db, id, "notices-int.com.ar");
    expect(await flagAndNotify(id)).toBe("skip:owner_live");
    expect(sent).toHaveLength(0);
  });

  it("tells about the daily cap once per site per day (criterion 4)", async () => {
    const a = await room();
    const b = await room();
    expect(await flagAndNotify(a, "site_cap")).toBe("notify");
    expect(sent[0].subject).toBe("Tu sitio notices-int.com.ar llegó al tope de hoy");
    expect(await flagAndNotify(b, "site_cap")).toBe("skip:cap_already_noticed");
    expect(sent).toHaveLength(1);
  });

  // Spec 014, criteria 11 and 12: a general failure means one email per owner per day.
  it("tells about model failures once per site per day, and still flags every conversation", async () => {
    const a = await room();
    const b = await room();
    expect(await flagAndNotify(a, "model_error")).toBe("notify");
    expect(sent[0].subject).toBe("El bot de notices-int.com.ar no pudo responder a un cliente");
    expect(await flagAndNotify(b, "model_error")).toBe("skip:error_already_noticed");
    expect(sent).toHaveLength(1);
    expect((await state(b)).needsAttention).toBe(true);
  });

  it("keeps the cap and model failure notices apart (spec 014)", async () => {
    expect(await flagAndNotify(await room(), "site_cap")).toBe("notify");
    expect(await flagAndNotify(await room(), "model_error")).toBe("notify");
    expect(sent).toHaveLength(2);
  });

  it("stops at 20 notified conversations per site per day and warns (criterion 5)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (let i = 0; i < 20; i++) expect(await flagAndNotify(await room())).toBe("notify");
    expect(await flagAndNotify(await room())).toBe("skip:site_daily_limit");
    expect(sent).toHaveLength(20);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("respects the site's switch (criterion 6)", async () => {
    await db.chatBot.updateMany({ where: { domainId: siteId }, data: { attentionEmail: false } });
    const id = await room();
    expect(await flagAndNotify(id)).toBe("skip:disabled");
    expect(sent).toHaveLength(0);
    expect((await state(id)).needsAttention).toBe(true);
  });

  it("replies to the visitor when they left their email (criterion 8)", async () => {
    const id = await room();
    const { customerId } = await db.chatRoom.findUniqueOrThrow({ where: { id }, select: { customerId: true } });
    await db.customer.update({ where: { id: customerId! }, data: { email: "ana@example.com", leadAt: new Date() } });
    await flagAndNotify(id);
    expect(sent[0].replyTo).toBe("ana@example.com");
  });

  it("never throws on a sender failure and leaves the room flagged (criterion 11)", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const broken: EmailSender = { send: async () => Promise.reject(new Error("Resend down")) };
    const id = await room();
    const flagged = await flagAttention(db, id, "derivation");
    await expect(
      notifyAttention(
        db,
        { roomId: id, domainId: siteId, reason: "derivation", flagged, now: new Date() },
        { ...deps, sender: broken },
      ),
    ).resolves.toBe("failed");
    expect(error).toHaveBeenCalled();
    const after = await state(id);
    expect(after.needsAttention).toBe(true);
    expect(after.attentionNotices).toBe(0);
    error.mockRestore();
  });
});
