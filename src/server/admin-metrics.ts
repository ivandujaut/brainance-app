import { COST_CAP_WARN_RATIO } from "@/domain/cost-cap";
import { percentile } from "@/domain/metrics";
import type { PrismaClient } from "@/generated/prisma/client";

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
  const [bySite, today, latencies, totals] = await Promise.all([
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
  ]);
  const domains = await db.domain.findMany({
    where: { id: { in: bySite.map((s) => s.domainId) } },
    select: { id: true, name: true, User: { select: { fullname: true } } },
  });
  const names = new Map(domains.map((d) => [d.id, d]));
  const spentToday = new Map(today.map((t) => [t.domainId, Number(t._sum.costUsd ?? 0)]));

  const sites = bySite
    .map((s) => ({
      domainId: s.domainId,
      site: names.get(s.domainId)?.name ?? "(borrado)",
      owner: names.get(s.domainId)?.User?.fullname ?? "",
      calls: s._count._all,
      errors: s._count.error,
      costUsd: Number(s._sum.costUsd ?? 0),
      spentTodayUsd: spentToday.get(s.domainId) ?? 0,
      nearCap: (spentToday.get(s.domainId) ?? 0) >= capUsd * COST_CAP_WARN_RATIO,
    }))
    .sort((a, b) => b.costUsd - a.costUsd);

  const values = latencies.map((l) => l.latencyMs);
  return {
    days,
    capUsd,
    totalCostUsd: Number(totals._sum.costUsd ?? 0),
    calls: totals._count._all,
    errorRate: totals._count._all ? totals._count.error / totals._count._all : 0,
    latencyP50: percentile(values, 50),
    latencyP95: percentile(values, 95),
    sites,
  };
};

export type AdminMetrics = Awaited<ReturnType<typeof adminMetrics>>;
