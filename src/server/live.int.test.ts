import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { addMessage, getOrCreateRoom, listMessages } from "./conversations";
import { flagAttention, ownerReply, RELEASE_NOTICE, releaseToBot, resolveVisitorTurn, takeOver } from "./live";

// Integration test (spec 006): needs a migrated Postgres in TEST_DATABASE_URL.
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("human takeover", () => {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  const clerkId = "user_int_test_live";
  const NAME = "live-int.com.ar";
  let siteId: string;
  let roomId: string;

  beforeEach(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    const user = await db.user.create({
      data: { clerkId, fullname: "Dueña", domains: { create: { name: NAME, icon: "" } } },
      include: { domains: true },
    });
    siteId = user.domains[0].id;
    roomId = await getOrCreateRoom(db, { domainId: siteId, visitorId: crypto.randomUUID() });
    await addMessage(db, roomId, "user", "¿Tienen sin TACC?");
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    await db.$disconnect();
  });

  const room = () => db.chatRoom.findUniqueOrThrow({ where: { id: roomId } });
  const roles = async () => (await listMessages(db, roomId)).map((m) => `${m.role}:${m.content}`);

  it("takes over once, clears the attention flag and tells the visitor", async () => {
    await flagAttention(db, roomId, "derivation");
    expect(await room()).toMatchObject({ needsAttention: true, attentionReason: "derivation" });

    expect(await takeOver(db, roomId, NAME)).toBe(true);
    expect(await takeOver(db, roomId, NAME)).toBe(false);
    const state = await room();
    expect(state.liveSince).toBeInstanceOf(Date);
    // The reason is kept as history for the dashboard; only the active flag is cleared.
    expect(state).toMatchObject({ needsAttention: false, attentionReason: "derivation" });
    expect(await roles()).toEqual(["user:¿Tienen sin TACC?", `system:Ahora te atiende una persona de ${NAME}.`]);
  });

  it("concurrent takeovers add a single notice", async () => {
    await Promise.all([takeOver(db, roomId, NAME), takeOver(db, roomId, NAME), takeOver(db, roomId, NAME)]);
    expect((await roles()).filter((r) => r.startsWith("system:"))).toHaveLength(1);
  });

  it("an owner reply takes over if needed, is stored as the owner's and updates the order of the inbox", async () => {
    const before = (await room()).lastMessageAt!;
    const reply = await ownerReply(db, roomId, "Sí, los jueves.", NAME);
    expect(reply).not.toBeNull();
    expect(await roles()).toEqual([
      "user:¿Tienen sin TACC?",
      `system:Ahora te atiende una persona de ${NAME}.`,
      "owner:Sí, los jueves.",
    ]);
    expect((await room()).lastMessageAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("rejects empty or overlong owner replies", async () => {
    expect(await ownerReply(db, roomId, "  ", NAME)).toBeNull();
    expect(await ownerReply(db, roomId, "a".repeat(2001), NAME)).toBeNull();
    expect((await room()).liveSince).toBeNull();
  });

  it("releasing hands the conversation back to the bot with a notice", async () => {
    await takeOver(db, roomId, NAME);
    expect(await releaseToBot(db, roomId)).toBe(true);
    expect(await releaseToBot(db, roomId)).toBe(false);
    expect((await room()).liveSince).toBeNull();
    expect((await roles()).at(-1)).toBe(`system:${RELEASE_NOTICE}`);
  });

  it("the bot stays quiet while the owner attends", async () => {
    expect(await resolveVisitorTurn(db, roomId)).toBe("bot");
    await takeOver(db, roomId, NAME);
    expect(await resolveVisitorTurn(db, roomId)).toBe("owner");
  });

  it("after 30 minutes without the owner writing, the next visitor message goes back to the bot", async () => {
    await takeOver(db, roomId, NAME);
    const later = new Date(Date.now() + 31 * 60 * 1000);
    expect(await resolveVisitorTurn(db, roomId, later)).toBe("bot");
    expect((await room()).liveSince).toBeNull();
    expect((await roles()).at(-1)).toBe(`system:${RELEASE_NOTICE}`);
  });

  it("an owner message within the window keeps the conversation live", async () => {
    await takeOver(db, roomId, NAME);
    await db.chatRoom.update({ where: { id: roomId }, data: { liveSince: new Date(Date.now() - 40 * 60 * 1000) } });
    await ownerReply(db, roomId, "Sigo acá.", NAME);
    expect(await resolveVisitorTurn(db, roomId)).toBe("owner");
  });

  it("lists messages after a cursor, for polling", async () => {
    const [first] = await listMessages(db, roomId);
    await addMessage(db, roomId, "assistant", "No tengo esa información.");
    expect((await listMessages(db, roomId, 50, first.id)).map((m) => m.content)).toEqual(["No tengo esa información."]);
  });
});
