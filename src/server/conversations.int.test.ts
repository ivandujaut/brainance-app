import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { addMessage, countSiteMessagesSince, countVisitorMessagesSince, getOrCreateRoom, listMessages } from "./conversations";

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

  it("counts visitor messages per site, across visitors, and never another site's", async () => {
    const before = await countSiteMessagesSince(db, siteB, hourAgo());
    for (const v of [visitor(), visitor()]) {
      const room = await getOrCreateRoom(db, { domainId: siteB, visitorId: v });
      await addMessage(db, room, "user", "hola");
      await addMessage(db, room, "assistant", "¡Hola!");
    }
    expect(await countSiteMessagesSince(db, siteB, hourAgo())).toBe(before + 2);

    const siteAOnly = await getOrCreateRoom(db, { domainId: siteA, visitorId: visitor() });
    await addMessage(db, siteAOnly, "user", "otro sitio");
    expect(await countSiteMessagesSince(db, siteB, hourAgo())).toBe(before + 2);
  });
});
