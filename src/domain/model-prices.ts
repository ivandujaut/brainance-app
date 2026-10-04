// Estimated cost of model calls (spec 007, ADR 0008). The real bill is the AI Gateway's: compare
// once a month and update these values when prices change.

/** USD per million tokens. */
export type ModelPrice = { input: number; output: number; cacheRead: number; cacheWrite: number };

/**
 * Anthropic first-party rates, verified 2026-09-25. Cache writes use the 5-minute TTL (1.25x input);
 * cache reads differ by model.
 */
export const PRICES_VERIFIED_AT = "2026-09-25";

const PRICES: Record<string, ModelPrice> = {
  "claude-haiku-4-5": { input: 1, output: 5, cacheRead: 0.1, cacheWrite: 1.25 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
  "claude-fable-5-1": { input: 10, output: 50, cacheRead: 0.25, cacheWrite: 12.5 },
};

/** "anthropic/claude-haiku-4.5" and "claude-haiku-4-5-20251001" are the same model. */
const normalize = (model: string) =>
  model
    .split("/")
    .pop()!
    .toLowerCase()
    .replace(/\./g, "-")
    .replace(/-\d{8}$/, "");

export const priceFor = (model: string): ModelPrice | null => PRICES[normalize(model)] ?? null;

export type TokenUsage = { inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number };

/** Mock models are free (E2E). */
const isMock = (model: string) => model.startsWith("mock/");

/**
 * Estimated USD cost, or null for an unpriced model. `inputTokens` includes the cached ones, as the
 * AI SDK reports it, so they are priced apart from regular input.
 */
export const estimateCost = (model: string, usage: TokenUsage): number | null => {
  if (isMock(model)) return 0;
  const price = priceFor(model);
  if (!price) return null;
  const regularInput = Math.max(0, usage.inputTokens - usage.cacheReadTokens - usage.cacheWriteTokens);
  return (
    (regularInput * price.input +
      usage.cacheReadTokens * price.cacheRead +
      usage.cacheWriteTokens * price.cacheWrite +
      usage.outputTokens * price.output) /
    1_000_000
  );
};
