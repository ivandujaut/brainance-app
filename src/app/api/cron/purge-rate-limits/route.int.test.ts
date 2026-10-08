import { NextRequest } from "next/server";
import { afterAll, describe, expect, it, vi } from "vitest";

// Spec 015, criterion 10: a daily cron deletes IP fingerprints older than a day.
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

describe.skipIf(!url)("purge of IP fingerprints", async () => {
  vi.stubEnv("CRON_SECRET", "cron-secret-de-prueba");
  const { client: db } = await import("@/lib/prisma");
  const { GET } = await import("./route");
  const domainId = crypto.randomUUID();

  afterAll(async () => {
    await db.rateLimitHit.deleteMany({ where: { domainId } });
    vi.unstubAllEnvs();
  });

  const call = (authorization?: string) =>
    GET(new NextRequest("http://localhost/api/cron/purge-rate-limits", { headers: authorization ? { authorization } : {} }));
  const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);

  it("needs the cron secret", async () => {
    expect((await call()).status).toBe(401);
    expect((await call("Bearer otra-cosa")).status).toBe(401);
  });

  it("deletes what is older than 24 hours and keeps the rest", async () => {
    await db.rateLimitHit.createMany({
      data: [hoursAgo(25), hoursAgo(30), hoursAgo(2)].map((createdAt) => ({ fingerprint: "f", domainId, kind: "message", createdAt })),
    });
    const res = await call("Bearer cron-secret-de-prueba");
    expect(res.status).toBe(200);
    expect((await res.json()).deleted).toBeGreaterThanOrEqual(2);
    expect(await db.rateLimitHit.count({ where: { domainId } })).toBe(1);
  });

  it("refuses everything when CRON_SECRET is not set", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await call("Bearer ")).status).toBe(401);
    vi.stubEnv("CRON_SECRET", "cron-secret-de-prueba");
  });
});
