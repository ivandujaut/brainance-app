import { describe, expect, it } from "vitest";
import { checkLeadIpLimits, checkMessageIpLimits, IP_LIMITS, ipKey } from "./ip-limits";

// Spec 015: limits per IP and site, so one connection cannot exhaust a site or invent visitors.

describe("IP_LIMITS", () => {
  it("keeps one IP well below the site's daily cap (criterion 2)", () => {
    expect(IP_LIMITS.burst).toEqual({ messages: 40, windowMs: 10 * 60_000 });
    expect(IP_LIMITS.daily).toEqual({ messages: 100, windowMs: 24 * 60 * 60_000 });
    expect(IP_LIMITS.newVisitors).toEqual({ visitors: 10, windowMs: 60 * 60_000 });
    expect(IP_LIMITS.leads).toEqual({ submissions: 10, windowMs: 60 * 60_000 });
  });
});

describe("checkMessageIpLimits", () => {
  const quiet = { burst: 0, daily: 0, newVisitors: 0, isNewVisitor: false };

  it("lets a normal visitor through", () => {
    expect(checkMessageIpLimits(quiet)).toEqual({ ok: true });
    expect(checkMessageIpLimits({ burst: 39, daily: 99, newVisitors: 9, isNewVisitor: true })).toEqual({ ok: true });
  });

  it("stops a burst of 40 messages in 10 minutes (criterion 1)", () => {
    expect(checkMessageIpLimits({ ...quiet, burst: 40 })).toEqual({ ok: false, reason: "ip_burst" });
  });

  it("stops at 100 messages a day, which says more than the burst (criterion 2)", () => {
    expect(checkMessageIpLimits({ ...quiet, daily: 100 })).toEqual({ ok: false, reason: "ip_daily" });
    expect(checkMessageIpLimits({ ...quiet, burst: 40, daily: 100 })).toEqual({ ok: false, reason: "ip_daily" });
  });

  it("stops new visitors after 10 in an hour, but not the ones that already exist (criterion 3)", () => {
    expect(checkMessageIpLimits({ ...quiet, newVisitors: 10, isNewVisitor: true })).toEqual({
      ok: false,
      reason: "ip_new_visitors",
    });
    expect(checkMessageIpLimits({ ...quiet, newVisitors: 10, isNewVisitor: false })).toEqual({ ok: true });
  });
});

describe("checkLeadIpLimits", () => {
  it("stops after 10 contact forms in an hour (criterion 6)", () => {
    expect(checkLeadIpLimits({ leads: 9 })).toEqual({ ok: true });
    expect(checkLeadIpLimits({ leads: 10 })).toEqual({ ok: false, reason: "ip_leads" });
  });
});

describe("ipKey", () => {
  it("keeps an IPv4 address as is (criterion 7)", () => {
    expect(ipKey("190.12.34.56")).toBe("190.12.34.56");
    expect(ipKey(" 190.12.34.56 ")).toBe("190.12.34.56");
  });

  it("reads an IPv4-mapped IPv6 address as IPv4", () => {
    expect(ipKey("::ffff:190.12.34.56")).toBe("190.12.34.56");
  });

  it("groups IPv6 addresses by their /64 prefix (criterion 7)", () => {
    expect(ipKey("2800:810:4e2:a1b2:1111:2222:3333:4444")).toBe("2800:810:4e2:a1b2::/64");
    expect(ipKey("2800:810:4e2:a1b2::1")).toBe("2800:810:4e2:a1b2::/64");
    expect(ipKey("2800:0810:04E2:A1B2:ffff::")).toBe("2800:810:4e2:a1b2::/64");
    expect(ipKey("2800:810::1")).toBe("2800:810:0:0::/64");
    expect(ipKey("::1")).toBe("0:0:0:0::/64");
  });

  it("rejects what is not an IP", () => {
    for (const value of ["", "unknown", "999.1.1.1", "1.2.3", "1:2:3:4:5:6:7:8:9", "1::2::3", "abc::xyz"]) {
      expect(ipKey(value)).toBeNull();
    }
  });
});
