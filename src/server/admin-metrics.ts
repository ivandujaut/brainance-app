import { COST_CAP_WARN_RATIO } from "@/domain/cost-cap";
import { percentile } from "@/domain/metrics";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";

// Operator metrics (spec 007, criteria 14–15). Server-only: never exposed as a server action.

/** ADMIN_CLERK_IDS is a comma-separated list of Clerk user ids. */
export const isAdmin = (clerkId: string | null | undefined, allowList = process.env.ADMIN_CLERK_IDS) => {
  if (!clerkId || !allowList) return false;
  return allowList
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .includes(clerkId);
};

const DAY_MS = 24 * 60 * 60 * 1000;
/** Enough for percentiles in the beta; sample when traffic grows. */
const MAX_LATENCY_SAMPLE = 20_000;

export const adminMetrics = async (db: PrismaClient, { days, capUsd }: { days: 1 | 7 | 30; capUsd: number }) => {
  const since = new Date(Date.now() - days * DAY_MS);
  const lastDay = new Date(Date.now() - DAY_MS);
  const [bySite, today, latencies, totals, fallbackRows, blockedRows] = await Promise.all([
    db.modelCall.groupBy({
      by: ["domainId"],
      where: { createdAt: { gte: since } },
      _sum: { costUsd: true },
      _count: { _all: true, error: true },
    }),
    db.modelCall.groupBy({ by: ["domainId"], where: { createdAt: { gte: lastDay } }, _sum: { costUsd: true } }),
    db.modelCall.findMany({
      where: { createdAt: { gte: since }, error: null },
      select: { latencyMs: true },
      orderBy: { createdAt: "desc" },
      take: MAX_LATENCY_SAMPLE,
    }),
    db.modelCall.aggregate({ where: { createdAt: { gte: since } }, _count: { _all: true, error: true }, _sum: { costUsd: true } }),
    // Spec 014, criterion 16: replies sent because the model failed, per site.
    db.$queryRaw<{ domainId: string; count: number }[]>(Prisma.sql`
      SELECT c."domainId" AS "domainId", count(*)::int AS count
      FROM "ChatMessage" m
      JOIN "ChatRoom" r ON r.id = m."chatRoomId"
      JOIN "Customer" c ON c.id = r."customerId"
      WHERE m.fallback AND m."createdAt" >= ${since}
      GROUP BY c."domainId"`),
    // Spec 015, criterion 11: requests stopped by the IP limit, per site.
    db.rateLimitHit.groupBy({ by: ["domainId"], where: { kind: "blocked", createdAt: { gte: since } }, _count: { _all: true } }),
  ]);
  const fallbacks = new Map(fallbackRows.map((f) => [f.domainId, f.count]));
  const blocked = new Map(blockedRows.map((b) => [b.domainId, b._count._all]));
  const calls = new Map(bySite.map((s) => [s.domainId, s]));
  // A site under attack may never have reached the model: it is listed for its stopped requests.
  const siteIds = [...new Set([...calls.keys(), ...blocked.keys()])];
  const domains = await db.domain.findMany({
    where: { id: { in: siteIds } },
    select: { id: true, name: true, User: { select: { fullname: true } } },
  });
  const names = new Map(domains.map((d) => [d.id, d]));
  const spentToday = new Map(today.map((t) => [t.domainId, Number(t._sum.costUsd ?? 0)]));

  const sites = siteIds
    .map((domainId) => {
      const s = calls.get(domainId);
      return {
        domainId,
        site: names.get(domainId)?.name ?? "(borrado)",
        owner: names.get(domainId)?.User?.fullname ?? "",
        calls: s?._count._all ?? 0,
        errors: s?._count.error ?? 0,
        fallbacks: fallbacks.get(domainId) ?? 0,
        blocked: blocked.get(domainId) ?? 0,
        costUsd: Number(s?._sum.costUsd ?? 0),
        spentTodayUsd: spentToday.get(domainId) ?? 0,
        nearCap: (spentToday.get(domainId) ?? 0) >= capUsd * COST_CAP_WARN_RATIO,
      };
    })
    .sort((a, b) => b.costUsd - a.costUsd || b.blocked - a.blocked);

  const values = latencies.map((l) => l.latencyMs);
  return {
    days,
    capUsd,
    totalCostUsd: Number(totals._sum.costUsd ?? 0),
    calls: totals._count._all,
    errorRate: totals._count._all ? totals._count.error / totals._count._all : 0,
    fallbacks: fallbackRows.reduce((sum, f) => sum + f.count, 0),
    blocked: blockedRows.reduce((sum, b) => sum + b._count._all, 0),
    latencyP50: percentile(values, 50),
    latencyP95: percentile(values, 95),
    sites,
  };
};

export type AdminMetrics = Awaited<ReturnType<typeof adminMetrics>>;
