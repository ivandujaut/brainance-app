import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";

const observability = vi.hoisted(() => ({ captureError: vi.fn(), captureWarning: vi.fn() }));
vi.mock("./observability", () => observability);

const { clientIp, DEV_RATE_LIMIT_SECRET, ipFingerprint, rateLimitSecret, recordIpBlock, requestFingerprint } =
  await import("./ip-limits");

// Spec 015: what identifies a connection, and what is stored about it.

afterEach(() => {
  observability.captureError.mockReset();
  observability.captureWarning.mockReset();
});

describe("clientIp", () => {
  it("takes the first address of x-forwarded-for, as Vercel sets it", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "190.12.34.56, 10.0.0.1" }))).toBe("190.12.34.56");
    expect(clientIp(new Headers({ "x-real-ip": "190.12.34.56" }))).toBe("190.12.34.56");
  });

  it("is null without an address (criterion 8)", () => {
    expect(clientIp(new Headers())).toBeNull();
    expect(clientIp(new Headers({ "x-forwarded-for": " " }))).toBeNull();
  });
});

describe("ipFingerprint", () => {
  it("is an HMAC of the IP, never the IP (criterion 7)", () => {
    const print = ipFingerprint("190.12.34.56", "secreto");
    expect(print).not.toContain("190");
    expect(print).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(ipFingerprint("190.12.34.56", "secreto")).toBe(print);
    expect(ipFingerprint("190.12.34.56", "otro")).not.toBe(print);
  });
});

describe("rateLimitSecret", () => {
  it("uses RATE_LIMIT_SECRET when set", () => {
    expect(rateLimitSecret({ NODE_ENV: "production", RATE_LIMIT_SECRET: "s" })).toBe("s");
  });

  it("uses a fixed secret outside production (criterion 9)", () => {
    expect(rateLimitSecret({ NODE_ENV: "development" })).toBe(DEV_RATE_LIMIT_SECRET);
  });

  it("fails open in production without a secret, and reports it once (criterion 9)", () => {
    expect(rateLimitSecret({ NODE_ENV: "production" })).toBeNull();
    expect(rateLimitSecret({ NODE_ENV: "production" })).toBeNull();
    expect(observability.captureError).toHaveBeenCalledTimes(1);
  });
});

describe("requestFingerprint", () => {
  const env = { NODE_ENV: "production", RATE_LIMIT_SECRET: "s" };

  it("groups an IPv6 /64 into one fingerprint (criterion 7)", () => {
    const a = requestFingerprint(new Headers({ "x-forwarded-for": "2800:810:4e2:a1b2::1" }), env);
    const b = requestFingerprint(new Headers({ "x-forwarded-for": "2800:810:4e2:a1b2:ffff::9" }), env);
    expect(a).not.toBeNull();
    expect(a).toBe(b);
  });

  it("is null without an IP, with something that is not one, or without a secret (criteria 8 and 9)", () => {
    expect(requestFingerprint(new Headers(), env)).toBeNull();
    expect(requestFingerprint(new Headers({ "x-forwarded-for": "unknown" }), env)).toBeNull();
    expect(requestFingerprint(new Headers({ "x-forwarded-for": "190.12.34.56" }), { NODE_ENV: "production" })).toBeNull();
  });
});

describe("recordIpBlock", () => {
  const db = () => ({ rateLimitHit: { create: vi.fn(async () => ({})) } }) as unknown as PrismaClient;

  it("records every stopped request and warns once per site and day, without the fingerprint (criteria 11 and 12)", async () => {
    const store = db();
    const now = new Date("2026-10-08T15:00:00Z");
    await recordIpBlock(store, { fingerprint: "huella", domainId: "site-a", reason: "ip_burst" }, now);
    await recordIpBlock(store, { fingerprint: "huella", domainId: "site-a", reason: "ip_daily" }, now);
    await recordIpBlock(store, { fingerprint: "huella", domainId: "site-b", reason: "ip_burst" }, now);
    expect(store.rateLimitHit.create).toHaveBeenCalledTimes(3);
    expect(observability.captureWarning).toHaveBeenCalledTimes(2);
    expect(observability.captureWarning).toHaveBeenCalledWith("Requests stopped by the IP limit", {
      area: "widget",
      domainId: "site-a",
      extra: { reason: "ip_burst" },
    });
    expect(JSON.stringify(observability.captureWarning.mock.calls)).not.toContain("huella");
  });
});
