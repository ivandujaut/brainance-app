import { describe, expect, it } from "vitest";
import { canAddDomain, domainLimitFor } from "./plans";

describe("domainLimitFor", () => {
  it.each([
    ["STANDARD", 1],
    ["PRO", 5],
    ["ULTIMATE", 10],
  ] as const)("allows %s accounts %i domain(s)", (plan, limit) => {
    expect(domainLimitFor(plan)).toBe(limit);
  });
});

describe("canAddDomain", () => {
  it("allows adding a domain while under the plan limit", () => {
    expect(canAddDomain({ plan: "PRO", currentDomains: 4 })).toBe(true);
  });

  it("rejects adding a domain once the plan limit is reached", () => {
    expect(canAddDomain({ plan: "STANDARD", currentDomains: 1 })).toBe(false);
    expect(canAddDomain({ plan: "ULTIMATE", currentDomains: 10 })).toBe(false);
  });

  it("rejects accounts without a subscription plan", () => {
    expect(canAddDomain({ plan: undefined, currentDomains: 0 })).toBe(false);
  });
});
