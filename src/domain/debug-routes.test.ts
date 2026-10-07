import { describe, expect, it } from "vitest";
import { debugRoutesEnabled } from "./debug-routes";

// Test-only routes (like /api/debug/sentry) exist in previews and locally, never in production.
describe("debugRoutesEnabled", () => {
  it("is on in Vercel previews and in local development", () => {
    expect(debugRoutesEnabled({ VERCEL_ENV: "preview", NODE_ENV: "production" })).toBe(true);
    expect(debugRoutesEnabled({ NODE_ENV: "development" })).toBe(true);
  });

  it("is off in production, on Vercel or anywhere else", () => {
    expect(debugRoutesEnabled({ VERCEL_ENV: "production", NODE_ENV: "production" })).toBe(false);
    expect(debugRoutesEnabled({ NODE_ENV: "production" })).toBe(false);
    expect(debugRoutesEnabled({ VERCEL_ENV: "production", NODE_ENV: "development" })).toBe(false);
  });
});
