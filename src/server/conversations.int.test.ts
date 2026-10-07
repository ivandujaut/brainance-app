import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import {
  addMessage,
  countSiteAnswersSince,
  countVisitorMessagesSince,
  getOrCreateRoom,
  listMessages,
  markDerivation,
} from "./conversations";

// Integration test: needs a migrated Postgres in TEST_DATABASE_URL (CI provides one).
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("widget conversations", () => {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  const clerkId = "user_int_test_conversations";
  let siteA: string;
  let siteB: string;
  const visitor = () => crypto.randomUUID();
  const hourAgo = () => new Date(Date.now() - 60 * 60 * 1000);

  beforeAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    const user = await db.user.create({
      data: {
        clerkId,
        fullname: "Test",
        domains: { create: [{ name: "a-int.com.ar", icon: "" }, { name: "b-int.com.ar", icon: "" }] },
      },
      include: { domains: true },
    });
    [siteA, siteB] = user.domains.map((d) => d.id);
  });

  afterAll(async () => {
    await db.customer.deleteMany({ where: { domainId: { in: [siteA, siteB] } } });
    await db.user.deleteMany({ where: { clerkId } });
    await db.$disconnect();
  });

  it("keeps one conversation per visitor and site across visits", async () => {
    const v = visitor();
    const first = await getOrCreateRoom(db, { domainId: siteA, visitorId: v });
    await addMessage(db, first, "user", "¿Hacen envíos?");
    await addMessage(db, first, "assistant", "Sí, a todo el país.");

    const again = await getOrCreateRoom(db, { domainId: siteA, visitorId: v });
    expect(again).toBe(first);
    expect((await listMessages(db, again)).map((m) => [m.role, m.content])).toEqual([
      ["user", "¿Hacen envíos?"],
      ["assistant", "Sí, a todo el país."],
    ]);
  });

  it("gives the same visitor id a separate conversation on another site", async () => {
    const v = visitor();
    const roomA = await getOrCreateRoom(db, { domainId: siteA, visitorId: v });
    const roomB = await getOrCreateRoom(db, { domainId: siteB, visitorId: v });
    expect(roomB).not.toBe(roomA);
  });

  it("returns the same conversation under concurrent first messages", async () => {
    const v = visitor();
    const rooms = await Promise.all(
      Array.from({ length: 6 }, () => getOrCreateRoom(db, { domainId: siteA, visitorId: v })),
    );
    expect(new Set(rooms).size).toBe(1);
    expect(await db.customer.count({ where: { domainId: siteA, visitorId: v } })).toBe(1);
  });

  it("counts only the visitor's own messages inside the window", async () => {
    const room = await getOrCreateRoom(db, { domainId: siteA, visitorId: visitor() });
    await addMessage(db, room, "user", "uno");
    await addMessage(db, room, "assistant", "respuesta");
    await addMessage(db, room, "user", "dos");
    const old = await addMessage(db, room, "user", "viejo");
    await db.chatMessage.update({ where: { id: old }, data: { createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) } });

    expect(await countVisitorMessagesSince(db, room, hourAgo())).toBe(2);
  });

  // Spec 011, criteria 4, 9 and 10: the cap counts the bot's answers, never a person's, per site.
  it("counts the bot's answers per site, across visitors, and never another site's or the owner's", async () => {
    const before = await countSiteAnswersSince(db, siteB, hourAgo());
    for (const v of [visitor(), visitor()]) {
      const room = await getOrCreateRoom(db, { domainId: siteB, visitorId: v });
      await addMessage(db, room, "user", "hola");
      await addMessage(db, room, "assistant", "¡Hola!");
    }
    expect(await countSiteAnswersSince(db, siteB, hourAgo())).toBe(before + 2);

    // A conversation attended by a person: the visitor's and the owner's messages do not count.
    const live = await getOrCreateRoom(db, { domainId: siteB, visitorId: visitor() });
    await addMessage(db, live, "user", "¿Hay stock?");
    await addMessage(db, live, "owner", "Sí, te lo reservo.");
    expect(await countSiteAnswersSince(db, siteB, hourAgo())).toBe(before + 2);

    const siteAOnly = await getOrCreateRoom(db, { domainId: siteA, visitorId: visitor() });
    await addMessage(db, siteAOnly, "user", "otro sitio");
    await addMessage(db, siteAOnly, "assistant", "otra respuesta");
    expect(await countSiteAnswersSince(db, siteB, hourAgo())).toBe(before + 2);
  });

  // Spec 011, criterion 13: a derivation is recorded on the bot's answer itself.
  it("marks an answer as a derivation, at creation or afterwards", async () => {
    const room = await getOrCreateRoom(db, { domainId: siteA, visitorId: visitor() });
    const plain = await addMessage(db, room, "assistant", "Sí, hacemos envíos.");
    const capped = await addMessage(db, room, "assistant", "No puedo responder más consultas.", { derivation: true });
    await markDerivation(db, plain);
    const rows = await db.chatMessage.findMany({ where: { id: { in: [plain, capped] } }, select: { id: true, derivation: true } });
    expect(rows.map((r) => r.derivation)).toEqual([true, true]);
  });
});
