import { checkCostCap, type CostCapState } from "@/domain/cost-cap";
import { dayKey } from "@/domain/metrics";
import { estimateCost } from "@/domain/model-prices";
import type { PrismaClient } from "@/generated/prisma/client";
import { captureError, captureWarning } from "@/server/observability";
import type { AnswerReport } from "./answer";

// AI usage per call (spec 007, ADR 0008): cost, tokens and latency. Never conversation text.

const DAY_MS = 24 * 60 * 60 * 1000;
const warnedUnpriced = new Set<string>();
const warnedNearCap = new Set<string>();

type Call = { domainId: string; chatRoomId: string | null; purpose: string; requestedModel: string; report: AnswerReport };

/** Stores the call. Never throws: a failed record must not affect the visitor's answer. */
export const recordModelCall = async (db: PrismaClient, { domainId, chatRoomId, purpose, requestedModel, report }: Call) => {
  try {
    // The served id is the most precise; fall back to the requested one (e.g. mock models report "echo").
    const pricedModel = report.servedModel ?? requestedModel;
    const cost = report.error
      ? 0
      : (estimateCost(pricedModel, report.usage) ?? estimateCost(requestedModel, report.usage));
    if (cost === null && !warnedUnpriced.has(pricedModel)) {
      warnedUnpriced.add(pricedModel);
      captureWarning(`Model without a price: ${pricedModel}`, { area: "ai", extra: { requestedModel } });
    }
    await db.modelCall.create({
      data: {
        domainId,
        chatRoomId,
        purpose,
        requestedModel,
        servedModel: report.servedModel,
        ...report.usage,
        costUsd: cost,
        latencyMs: report.latencyMs,
        finishReason: report.finishReason,
        error: report.error?.slice(0, 500) ?? null,
      },
    });
  } catch (error) {
    captureError(error, { area: "ai", domainId });
  }
};

export const siteSpendSince = async (db: PrismaClient, domainId: string, since: Date) => {
  const { _sum } = await db.modelCall.aggregate({ where: { domainId, createdAt: { gte: since } }, _sum: { costUsd: true } });
  return Number(_sum.costUsd ?? 0);
};

/** Where the site stands against its daily AI cost cap; warns Sentry once per site and day at 80%. */
export const siteCostState = async (db: PrismaClient, domainId: string, capUsd: number): Promise<CostCapState> => {
  const spentUsd = await siteSpendSince(db, domainId, new Date(Date.now() - DAY_MS));
  const state = checkCostCap({ spentUsd, capUsd });
  const key = `${domainId}:${dayKey(new Date())}`;
  if (state !== "ok" && !warnedNearCap.has(key)) {
    warnedNearCap.add(key);
    captureWarning(state === "blocked" ? "Site reached its daily AI cost cap" : "Site near its daily AI cost cap", {
      area: "ai",
      domainId,
      extra: { spentUsd: Number(spentUsd.toFixed(4)), capUsd },
    });
  }
  return state;
};
