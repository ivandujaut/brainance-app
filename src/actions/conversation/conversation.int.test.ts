import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// Spec 006: the owner's inbox. Isolation between tenants is covered in tenant-isolation.int.test.ts.
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

const OWNER = "user_int_inbox";
vi.mock("@clerk/nextjs/server", () => ({ currentUser: async () => ({ id: OWNER }), clerkClient: async () => ({}) }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

describe.skipIf(!url)("inbox actions", async () => {
  const { client: db } = await import("@/lib/prisma");
  const inbox = await import(".");
  let panaderia: string;
  let taller: string;
  let ana: string;
  let beto: string;

  const room = async (domainId: string, messages: { role: "user" | "assistant"; text: string; seen?: boolean }[], minutesAgo: number, extra = {}) => {
    const at = new Date(Date.now() - minutesAgo * 60 * 1000);
    const customer = await db.customer.create({
      data: {
        domainId,
        visitorId: crypto.randomUUID(),
        ...extra,
        chatRoom: {
          create: {
            lastMessageAt: at,
            message: {
              create: messages.map((m, i) => ({
                role: m.role,
                message: m.text,
                seen: m.seen ?? false,
                createdAt: new Date(at.getTime() - (messages.length - i) * 1000),
              })),
            },
          },
        },
      },
      include: { chatRoom: true },
    });
    return customer.chatRoom[0].id;
  };

  beforeEach(async () => {
    await db.user.deleteMany({ where: { clerkId: OWNER } });
    const owner = await db.user.create({
      data: {
        clerkId: OWNER,
        fullname: "Dueña",
        domains: { create: [{ name: "panaderia.com.ar", icon: "" }, { name: "taller.com.ar", icon: "" }] },
      },
      include: { domains: { orderBy: { name: "asc" } } },
    });
    [panaderia, taller] = owner.domains.map((d) => d.id);
    ana = await room(panaderia, [{ role: "user", text: "¿Tienen sin TACC?" }, { role: "assistant", text: "No tengo ese dato." }], 30, {
      email: "ana@example.com",
      leadAt: new Date(),
      questions: { create: { question: "¿Qué buscás?", answered: "Tortas" } },
    });
    beto = await room(taller, [{ role: "user", text: "¿Cambian aceite?", seen: true }, { role: "assistant", text: "Sí." }], 5);
    await db.chatRoom.update({ where: { id: ana }, data: { needsAttention: true, attentionReason: "derivation" } });
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId: OWNER } });
    await db.$disconnect();
  });

  it("lists every conversation of the owner's sites, most recent first, with unread counts", async () => {
    const list = await inbox.onListConversations({});
    expect(list.map((c) => [c.site, c.visitor, c.lastMessage, c.unread])).toEqual([
      ["taller.com.ar", "Visitante", "Sí.", 0],
      ["panaderia.com.ar", "ana@example.com", "No tengo ese dato.", 1],
    ]);
    expect(list[1]).toMatchObject({ needsAttention: true, live: false });
  });

  it("filters by site, unread and needs attention", async () => {
    expect((await inbox.onListConversations({ siteId: taller })).map((c) => c.id)).toEqual([beto]);
    expect((await inbox.onListConversations({ filter: "unread" })).map((c) => c.id)).toEqual([ana]);
    expect((await inbox.onListConversations({ filter: "attention" })).map((c) => c.id)).toEqual([ana]);
  });

  it("opens a conversation with its messages and the lead's data, and marks it read", async () => {
    const conversation = await inbox.onGetConversation(ana);
    expect(conversation).toMatchObject({
      id: ana,
      site: "panaderia.com.ar",
      live: false,
      lead: { email: "ana@example.com", responses: [{ question: "¿Qué buscás?", answered: "Tortas" }] },
    });
    expect(conversation!.messages.map((m) => m.role)).toEqual(["user", "assistant"]);

    await inbox.onMarkRead(ana);
    expect((await inbox.onListConversations({ filter: "unread" })).map((c) => c.id)).toEqual([]);
  });

  it("returns only new messages after a cursor", async () => {
    const { messages } = (await inbox.onGetConversation(ana))!;
    await inbox.onOwnerReply(ana, "Sí, los jueves.");
    const update = await inbox.onGetConversation(ana, messages.at(-1)!.id);
    expect(update!.messages.map((m) => `${m.role}:${m.content}`)).toEqual([
      "system:Ahora te atiende una persona de panaderia.com.ar.",
      "owner:Sí, los jueves.",
    ]);
    expect(update!.live).toBe(true);
  });

  it("takes over and releases, clearing the attention flag", async () => {
    expect((await inbox.onTakeOver(ana)).status).toBe(200);
    expect((await inbox.onGetConversation(ana))).toMatchObject({ live: true, needsAttention: false });
    expect((await inbox.onReleaseToBot(ana)).status).toBe(200);
    expect((await inbox.onGetConversation(ana))!.live).toBe(false);
  });

  // Spec 012, criteria 2 and 4: marked as attended, it leaves the filter but not its place.
  it("marks a conversation as attended without moving it in the inbox", async () => {
    const before = await inbox.onListConversations({ filter: "attention" });
    expect(before.map((c) => c.id)).toEqual([ana]);
    expect(await inbox.onMarkAttended(ana)).toEqual({ status: 200, message: "Marcada como atendida" });
    expect(await inbox.onListConversations({ filter: "attention" })).toEqual([]);
    expect((await inbox.onListConversations({})).map((c) => c.id)).toEqual([beto, ana]);
    expect(await inbox.onGetConversation(ana)).toMatchObject({ needsAttention: false, live: false });
    // Already attended: same answer, nothing changes.
    expect((await inbox.onMarkAttended(ana)).status).toBe(200);
  });

  it("rejects empty or overlong replies", async () => {
    expect((await inbox.onOwnerReply(ana, " ")).status).toBe(400);
    expect((await inbox.onOwnerReply(ana, "a".repeat(2001))).status).toBe(400);
  });
});
