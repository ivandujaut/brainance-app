import { NextRequest } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Spec 014: when the model fails, the visitor gets the business's contact, the conversation needs
// attention and the owner hears about it. The mock model fails on demand with markers in the question.
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

// `after()` needs a request scope: run the callbacks right away and let the tests wait for them.
const pending = vi.hoisted(() => [] as Promise<unknown>[]);
vi.mock("next/server", async (original) => ({
  ...(await original<typeof import("next/server")>()),
  after: (task: () => unknown) => void pending.push(Promise.resolve().then(task)),
}));

describe.skipIf(!url)("widget messages when the model fails", async () => {
  vi.stubEnv("AI_ANSWER_MODEL", "mock/echo");
  vi.stubEnv("AI_ALLOW_MOCK_MODEL", "true");
  vi.stubEnv("EMAIL_PROVIDER", "log");
  const { client: db } = await import("@/lib/prisma");
  const { POST } = await import("./route");
  const { countSiteAnswersSince } = await import("@/server/conversations");
  const clerkId = "user_int_widget_fallback";
  const contact = "WhatsApp +54 9 341 555-0101";
  let domainId: string;

  beforeAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    const user = await db.user.create({
      data: {
        clerkId,
        fullname: "Dueña",
        email: "duena@example.com",
        domains: { create: { name: "fallback-int.com.ar", icon: "", chatBot: { create: { contact } } } },
      },
      include: { domains: true },
    });
    domainId = user.domains[0].id;
  });

  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    await db.$disconnect();
    vi.unstubAllEnvs();
  });

  const send = async (visitorId: string, text: string) => {
    const res = await POST(
      new NextRequest(`http://localhost/api/widget/${domainId}/messages`, {
        method: "POST",
        body: JSON.stringify({ visitorId, text }),
      }),
      { params: Promise.resolve({ domainId }) },
    );
    const body = await res.text();
    await Promise.all(pending.splice(0));
    return { status: res.status, body };
  };

  const roomOf = (visitorId: string) =>
    db.chatRoom.findFirstOrThrow({
      where: { Customer: { domainId, visitorId } },
      select: {
        id: true,
        needsAttention: true,
        attentionReason: true,
        attentionNotifiedAt: true,
        message: {
          orderBy: { createdAt: "asc" },
          select: { role: true, message: true, derivation: true, fallback: true },
        },
      },
    });

  const fallback = `No pude responder tu consulta en este momento. Podés comunicarte con el negocio por ${contact}.`;

  it("answers with the contact, stores it once as a derivation and flags the conversation (criteria 1, 7, 8, 9)", async () => {
    const visitor = crypto.randomUUID();
    const { status, body } = await send(visitor, "¿Abren hoy? [falla]");
    expect(status).toBe(200);
    expect(body).toBe(fallback);

    const room = await roomOf(visitor);
    expect(room.message).toEqual([
      { role: "user", message: "¿Abren hoy? [falla]", derivation: false, fallback: false },
      { role: "assistant", message: fallback, derivation: true, fallback: true },
    ]);
    expect(room).toMatchObject({ needsAttention: true, attentionReason: "model_error" });
  });

  it("keeps what arrived of a cut answer and adds the contact (criterion 4)", async () => {
    const visitor = crypto.randomUUID();
    const { body } = await send(visitor, "¿Abren hoy? [corte]");
    expect(body).toBe(`Respuesta de \n\n${fallback}`);
    const room = await roomOf(visitor);
    expect(room.message.at(-1)).toMatchObject({ message: body, fallback: true, derivation: true });
  });

  it("answers with the contact when the model answers nothing (criterion 3)", async () => {
    const visitor = crypto.randomUUID();
    expect((await send(visitor, "¿Abren hoy? [vacio]")).body).toBe(fallback);
    expect((await roomOf(visitor)).attentionReason).toBe("model_error");
  });

  it("records the failed call and emails the owner once a day (criteria 10, 11, 12)", async () => {
    const before = await db.modelCall.count({ where: { domainId, error: { not: null } } });
    const first = crypto.randomUUID();
    const second = crypto.randomUUID();
    await send(first, "hola [falla]");
    await send(second, "hola [falla]");
    expect(await db.modelCall.count({ where: { domainId, error: { not: null } } })).toBe(before + 2);
    // Earlier tests already got today's notice: later failures only flag the conversation.
    const notified = await db.chatRoom.count({
      where: { Customer: { domainId }, attentionReason: "model_error", attentionNotifiedAt: { not: null } },
    });
    expect(notified).toBe(1);
    expect((await roomOf(second)).needsAttention).toBe(true);
  });

  it("keeps the flag when the model answers the next message (criterion 14)", async () => {
    const visitor = crypto.randomUUID();
    await send(visitor, "hola [falla]");
    const { body } = await send(visitor, "¿Hacen envíos?");
    expect(body).toBe("Respuesta de prueba a: ¿Hacen envíos?");
    const room = await roomOf(visitor);
    expect(room).toMatchObject({ needsAttention: true, attentionReason: "model_error" });
    expect(room.message.at(-1)).toMatchObject({ derivation: false, fallback: false });
  });

  it("counts the fallback toward the site's daily answers (criterion 17)", async () => {
    const since = new Date(Date.now() - 60_000);
    const before = await countSiteAnswersSince(db, domainId, since);
    await send(crypto.randomUUID(), "hola [falla]");
    expect(await countSiteAnswersSince(db, domainId, since)).toBe(before + 1);
  });
});
