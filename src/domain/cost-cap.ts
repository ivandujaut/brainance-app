// Daily AI cost cap per site (spec 007): warn at 80%, stop calling the model at 100%.

export const COST_CAP_WARN_RATIO = 0.8;
export const DEFAULT_DAILY_COST_CAP_USD = 2;

export type CostCapState = "ok" | "warn" | "blocked";

export const checkCostCap = ({ spentUsd, capUsd }: { spentUsd: number; capUsd: number }): CostCapState => {
  if (spentUsd >= capUsd) return "blocked";
  if (spentUsd >= capUsd * COST_CAP_WARN_RATIO) return "warn";
  return "ok";
};

/** AI_SITE_DAILY_COST_USD, or the default when unset or invalid. */
export const dailyCostCapUsd = (raw: string | undefined) => {
  const value = Number(raw);
  return raw && Number.isFinite(value) && value > 0 ? value : DEFAULT_DAILY_COST_CAP_USD;
};
