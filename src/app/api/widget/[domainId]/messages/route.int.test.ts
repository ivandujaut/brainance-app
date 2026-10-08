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

// Spec 015: limits per IP and site. The test runs outside production, so fingerprints use the
// development secret and can be seeded directly.
describe.skipIf(!url)("widget messages limited by IP", async () => {
  vi.stubEnv("AI_ANSWER_MODEL", "mock/echo");
  vi.stubEnv("AI_ALLOW_MOCK_MODEL", "true");
  vi.stubEnv("EMAIL_PROVIDER", "log");
  const { client: db } = await import("@/lib/prisma");
  const { POST } = await import("./route");
  const { DEV_RATE_LIMIT_SECRET, ipFingerprint } = await import("@/server/ip-limits");
  const clerkId = "user_int_widget_ip";
  const contact = "WhatsApp +54 9 341 555-0101";
  let siteA: string;
  let siteB: string;
  let ipCounter = 0;

  beforeAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    const user = await db.user.create({
      data: {
        clerkId,
        fullname: "Dueña",
        email: "duena@example.com",
        domains: {
          create: [
            { name: "a-ip-int.com.ar", icon: "", chatBot: { create: { contact } } },
            { name: "b-ip-int.com.ar", icon: "", chatBot: { create: { contact, addressing: "usted" } } },
          ],
        },
      },
      include: { domains: { orderBy: { name: "asc" } } },
    });
    [siteA, siteB] = user.domains.map((d) => d.id);
  });

  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(async () => {
    await db.rateLimitHit.deleteMany({ where: { domainId: { in: [siteA, siteB] } } });
    await db.user.deleteMany({ where: { clerkId } });
  });

  /** A fresh documentation address per test, so tests do not share counts. */
  const newIp = () => `198.51.100.${++ipCounter}`;
  const send = async (domainId: string, ip: string | null, visitorId: string, text = "¿Hacen envíos?") => {
    const res = await POST(
      new NextRequest(`http://localhost/api/widget/${domainId}/messages`, {
        method: "POST",
        headers: ip ? { "x-forwarded-for": ip } : {},
        body: JSON.stringify({ visitorId, text }),
      }),
      { params: Promise.resolve({ domainId }) },
    );
    const body = await res.text();
    await Promise.all(pending.splice(0));
    return { status: res.status, body };
  };
  const seed = (domainId: string, ip: string, kind: string, count: number, minutesAgo = 1) =>
    db.rateLimitHit.createMany({
      data: Array.from({ length: count }, () => ({
        fingerprint: ipFingerprint(ip, DEV_RATE_LIMIT_SECRET),
        domainId,
        kind,
        createdAt: new Date(Date.now() - minutesAgo * 60_000),
      })),
    });
  const visitorsOf = (domainId: string) => db.customer.count({ where: { domainId } });
  const hitsOf = (domainId: string, ip: string, kind: string) =>
    db.rateLimitHit.count({ where: { domainId, kind, fingerprint: ipFingerprint(ip, DEV_RATE_LIMIT_SECRET) } });

  it("counts each message and each new visitor of the connection, without storing the IP (criterion 7)", async () => {
    const ip = newIp();
    expect((await send(siteA, ip, crypto.randomUUID())).status).toBe(200);
    expect(await hitsOf(siteA, ip, "message")).toBe(1);
    expect(await hitsOf(siteA, ip, "new_visitor")).toBe(1);
    const stored = await db.rateLimitHit.findMany({ where: { domainId: siteA }, select: { fingerprint: true } });
    expect(JSON.stringify(stored)).not.toContain(ip);
  });

  it("stops a burst of 40 messages in 10 minutes without storing or answering (criterion 1)", async () => {
    const ip = newIp();
    const visitor = crypto.randomUUID();
    await send(siteA, ip, visitor);
    await seed(siteA, ip, "message", 39);
    const before = await db.chatMessage.count({ where: { ChatRoom: { Customer: { domainId: siteA } } } });
    const { status, body } = await send(siteA, ip, visitor, "otra vez");
    expect(status).toBe(429);
    expect(JSON.parse(body)).toEqual({
      error: "ip_burst",
      message: "Se enviaron muchos mensajes desde tu conexión. Esperá unos minutos y volvé a intentar.",
    });
    expect(await db.chatMessage.count({ where: { ChatRoom: { Customer: { domainId: siteA } } } })).toBe(before);
    expect(await hitsOf(siteA, ip, "blocked")).toBe(1);
  });

  it("stops at 100 messages a day and gives the contact in the site's addressing (criterion 2)", async () => {
    const ip = newIp();
    await seed(siteB, ip, "message", 100, 60 * 5);
    const { status, body } = await send(siteB, ip, crypto.randomUUID());
    expect(status).toBe(429);
    expect(JSON.parse(body)).toEqual({
      error: "ip_daily",
      message: `Desde su conexión se enviaron muchos mensajes hoy. Puede comunicarse con el negocio por ${contact}.`,
    });
  });

  it("does not create an 11th new visitor in an hour, but known visitors keep chatting (criterion 3)", async () => {
    const ip = newIp();
    const known = crypto.randomUUID();
    await send(siteA, ip, known);
    await seed(siteA, ip, "new_visitor", 9);
    const visitors = await visitorsOf(siteA);
    const { status } = await send(siteA, ip, crypto.randomUUID());
    expect(status).toBe(429);
    expect(await visitorsOf(siteA)).toBe(visitors);
    expect((await send(siteA, ip, known, "sigo acá")).status).toBe(200);
  });

  it("keeps limits apart per site (criterion 4)", async () => {
    const ip = newIp();
    await seed(siteA, ip, "message", 100, 60);
    expect((await send(siteA, ip, crypto.randomUUID())).status).toBe(429);
    expect((await send(siteB, ip, crypto.randomUUID())).status).toBe(200);
  });

  it("counts messages of a conversation a person attends (criterion 5)", async () => {
    const ip = newIp();
    const visitor = crypto.randomUUID();
    await send(siteA, ip, visitor);
    await db.chatRoom.updateMany({ where: { Customer: { domainId: siteA, visitorId: visitor } }, data: { liveSince: new Date() } });
    await send(siteA, ip, visitor, "¿Hay alguien?");
    expect(await hitsOf(siteA, ip, "message")).toBe(2);
  });

  it("does not limit by IP without an address (criterion 8)", async () => {
    const before = await db.rateLimitHit.count({ where: { domainId: siteA } });
    expect((await send(siteA, null, crypto.randomUUID())).status).toBe(200);
    expect(await db.rateLimitHit.count({ where: { domainId: siteA } })).toBe(before);
  });

  it("applies the visitor's own limit after the IP's (criterion 14)", async () => {
    const ip = newIp();
    const { status, body } = await send(siteA, ip, crypto.randomUUID(), "x".repeat(1001));
    expect(status).toBe(400);
    expect(JSON.parse(body).error).toBe("too_long");
    expect(await hitsOf(siteA, ip, "message")).toBe(1);
  });
});
