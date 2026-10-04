import { describe, expect, it } from "vitest";
import { estimateCost, priceFor } from "./model-prices";

const usage = (input: number, output: number, cacheRead = 0, cacheWrite = 0) => ({
  inputTokens: input,
  outputTokens: output,
  cacheReadTokens: cacheRead,
  cacheWriteTokens: cacheWrite,
});

describe("priceFor", () => {
  it("finds a model by its gateway id or by the provider's own id", () => {
    expect(priceFor("anthropic/claude-haiku-4.5")).toMatchObject({ input: 1, output: 5 });
    expect(priceFor("claude-haiku-4-5-20251001")).toMatchObject({ input: 1, output: 5 });
    expect(priceFor("anthropic/claude-sonnet-5.5")).toMatchObject({ input: 2, output: 10 });
  });

  it("returns null for models without a price", () => {
    expect(priceFor("openai/gpt-x")).toBeNull();
    expect(priceFor("mock/echo")).toBeNull();
  });
});

describe("estimateCost", () => {
  it("prices input and output per million tokens", () => {
    // Haiku 4.5: USD 1 input, 5 output per MTok.
    expect(estimateCost("anthropic/claude-haiku-4.5", usage(1_000_000, 1_000_000))).toBeCloseTo(6, 6);
    expect(estimateCost("anthropic/claude-haiku-4.5", usage(2000, 300))).toBeCloseTo(0.0035, 8);
  });

  it("counts cached tokens apart from regular input (input tokens include them)", () => {
    // 10k input of which 8k read from cache and 1k written: 1k regular + 8k at 0.1x + 1k at 1.25x.
    const cost = estimateCost("anthropic/claude-haiku-4.5", usage(10_000, 0, 8_000, 1_000));
    expect(cost).toBeCloseTo((1000 * 1 + 8000 * 0.1 + 1000 * 1.25) / 1_000_000, 10);
  });

  it("returns null for models without a price, and 0 for free mock models", () => {
    expect(estimateCost("openai/gpt-x", usage(1000, 1000))).toBeNull();
    expect(estimateCost("mock/echo", usage(1000, 1000))).toBe(0);
  });
});
