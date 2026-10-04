import { describe, expect, it } from "vitest";
import { checkCostCap, COST_CAP_WARN_RATIO, dailyCostCapUsd } from "./cost-cap";

describe("checkCostCap", () => {
  it("is ok below 80% of the cap", () => {
    expect(COST_CAP_WARN_RATIO).toBe(0.8);
    expect(checkCostCap({ spentUsd: 1.59, capUsd: 2 })).toBe("ok");
  });

  it("warns from 80% of the cap", () => {
    expect(checkCostCap({ spentUsd: 1.6, capUsd: 2 })).toBe("warn");
    expect(checkCostCap({ spentUsd: 1.99, capUsd: 2 })).toBe("warn");
  });

  it("blocks at the cap", () => {
    expect(checkCostCap({ spentUsd: 2, capUsd: 2 })).toBe("blocked");
    expect(checkCostCap({ spentUsd: 5, capUsd: 2 })).toBe("blocked");
  });
});

describe("dailyCostCapUsd", () => {
  it("defaults to USD 2 and accepts a positive override", () => {
    expect(dailyCostCapUsd(undefined)).toBe(2);
    expect(dailyCostCapUsd("5.5")).toBe(5.5);
  });

  it("ignores invalid values", () => {
    expect(dailyCostCapUsd("")).toBe(2);
    expect(dailyCostCapUsd("abc")).toBe(2);
    expect(dailyCostCapUsd("-1")).toBe(2);
    expect(dailyCostCapUsd("0")).toBe(2);
  });
});
