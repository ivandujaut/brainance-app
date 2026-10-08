import { NextRequest } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Spec 015, criterion 6: contact forms are limited per IP and site.
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

const pending = vi.hoisted(() => [] as Promise<unknown>[]);
vi.mock("next/server", async (original) => ({
  ...(await original<typeof import("next/server")>()),
  after: (task: () => unknown) => void pending.push(Promise.resolve().then(task)),
}));

describe.skipIf(!url)("widget leads limited by IP", async () => {
  vi.stubEnv("EMAIL_PROVIDER", "log");
  const { client: db } = await import("@/lib/prisma");
  const { POST } = await import("./route");
  const { DEV_RATE_LIMIT_SECRET, ipFingerprint } = await import("@/server/ip-limits");
  const clerkId = "user_int_widget_lead_ip";
  const ip = "198.51.100.200";
  let domainId: string;

  beforeAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    const user = await db.user.create({
      data: {
        clerkId,
        fullname: "Dueña",
        email: "duena@example.com",
        domains: { create: { name: "lead-ip-int.com.ar", icon: "", chatBot: { create: {} } } },
      },
      include: { domains: true },
    });
    domainId = user.domains[0].id;
  });

  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(async () => {
    await db.rateLimitHit.deleteMany({ where: { domainId } });
    await db.user.deleteMany({ where: { clerkId } });
  });

  const submit = async () => {
    const res = await POST(
      new NextRequest(`http://localhost/api/widget/${domainId}/lead`, {
        method: "POST",
        headers: { "x-forwarded-for": ip },
        body: JSON.stringify({ visitorId: crypto.randomUUID(), email: "ana@example.com", answers: [] }),
      }),
      { params: Promise.resolve({ domainId }) },
    );
    await Promise.all(pending.splice(0));
    return { status: res.status, body: await res.json() };
  };
  const leads = () => db.customer.count({ where: { domainId, leadAt: { not: null } } });

  it("takes contact forms until 10 in an hour from one connection, then stores nothing", async () => {
    expect((await submit()).status).toBe(200);
    await db.rateLimitHit.createMany({
      data: Array.from({ length: 9 }, () => ({ fingerprint: ipFingerprint(ip, DEV_RATE_LIMIT_SECRET), domainId, kind: "lead" })),
    });
    const before = await leads();
    expect(await submit()).toEqual({
      status: 429,
      body: { message: "Se enviaron muchos datos desde tu conexión. Esperá un rato y volvé a intentar." },
    });
    expect(await leads()).toBe(before);
  });
});
