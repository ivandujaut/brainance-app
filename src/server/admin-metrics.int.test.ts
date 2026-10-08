import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { adminMetrics, isAdmin } from "./admin-metrics";

// Spec 007, criteria 14–15: operator metrics, only for ADMIN_CLERK_IDS.
const url = process.env.TEST_DATABASE_URL;

describe("isAdmin", () => {
  it("accepts only the listed Clerk ids", () => {
    expect(isAdmin("user_a", "user_a, user_b")).toBe(true);
    expect(isAdmin("user_b", "user_a,user_b")).toBe(true);
    expect(isAdmin("user_c", "user_a,user_b")).toBe(false);
    expect(isAdmin(null, "user_a")).toBe(false);
    expect(isAdmin("user_a", undefined)).toBe(false);
    expect(isAdmin("", "")).toBe(false);
  });
});

describe.skipIf(!url)("adminMetrics", () => {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  const clerkId = "user_int_admin_metrics";
  let cara: string;
  let barato: string;

  beforeAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    const user = await db.user.create({
      data: { clerkId, fullname: "Dueña Admin", domains: { create: [{ name: "cara-admin.com.ar", icon: "" }, { name: "barato-admin.com.ar", icon: "" }] } },
      include: { domains: { orderBy: { name: "desc" } } },
    });
    [cara, barato] = user.domains.map((d) => d.id);
    const call = (domainId: string, costUsd: number, latencyMs: number, error: string | null = null, hoursAgo = 1) => ({
      domainId,
      purpose: "answer",
      requestedModel: "anthropic/claude-haiku-4.5",
      costUsd,
      latencyMs,
      error,
      createdAt: new Date(Date.now() - hoursAgo * 3600 * 1000),
    });
    await db.modelCall.createMany({
      data: [
        call(cara, 1.0, 800),
        call(cara, 0.7, 1200),
        call(cara, 0, 3000, "provider down"),
        call(barato, 0.01, 600),
        call(barato, 5, 600, null, 24 * 10),
      ],
    });
    // Spec 014: two replies sent because the model failed, one of them outside the last day.
    const fallbackAt = (hoursAgo: number) => ({
      role: "assistant" as const,
      message: "No pude responder tu consulta en este momento.",
      derivation: true,
      fallback: true,
      createdAt: new Date(Date.now() - hoursAgo * 3600 * 1000),
    });
    await db.customer.create({
      data: {
        domainId: cara,
        visitorId: crypto.randomUUID(),
        chatRoom: { create: { message: { create: [fallbackAt(1), fallbackAt(24 * 3)] } } },
      },
    });
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    await db.$disconnect();
  });

  it("reports cost per site, latency percentiles, error rate and sites near the cap", async () => {
    const m = await adminMetrics(db, { days: 1, capUsd: 2 });
    const mine = m.sites.filter((s) => [cara, barato].includes(s.domainId));
    expect(mine.map((s) => [s.site, s.owner, s.calls, Number(s.costUsd.toFixed(2))])).toEqual([
      ["cara-admin.com.ar", "Dueña Admin", 3, 1.7],
      ["barato-admin.com.ar", "Dueña Admin", 1, 0.01],
    ]);
    expect(mine[0]).toMatchObject({ errors: 1, fallbacks: 1, nearCap: true });
    expect(mine[1]).toMatchObject({ fallbacks: 0, nearCap: false });
    expect(m.fallbacks).toBeGreaterThanOrEqual(1);
    expect(m.totalCostUsd).toBeGreaterThanOrEqual(1.71);
    expect(m.latencyP50).not.toBeNull();
    expect(m.errorRate).toBeGreaterThan(0);
  });

  it("widens the window", async () => {
    const m = await adminMetrics(db, { days: 30, capUsd: 2 });
    expect(m.sites.find((s) => s.domainId === barato)?.calls).toBe(2);
    expect(m.sites.find((s) => s.domainId === cara)?.fallbacks).toBe(2);
  });
});
