import { describe, expect, it } from "vitest";
import { frameAncestors, originMatchesDomain } from "./widget-origin";

describe("frameAncestors", () => {
  it("allows the site and its subdomains over HTTPS", () => {
    expect(frameAncestors("tienda.com.ar")).toBe("frame-ancestors https://tienda.com.ar https://*.tienda.com.ar");
  });

  it("also allows plain HTTP when insecure origins are enabled (development and E2E)", () => {
    expect(frameAncestors("tienda.test", { allowHttp: true })).toBe(
      "frame-ancestors https://tienda.test https://*.tienda.test http://tienda.test http://*.tienda.test http://localhost:*",
    );
  });

  it("blocks every embedder when the site is unknown", () => {
    expect(frameAncestors(null)).toBe("frame-ancestors 'none'");
  });
});

describe("originMatchesDomain", () => {
  it.each(["https://tienda.com.ar", "https://www.tienda.com.ar", "https://shop.tienda.com.ar/", "https://tienda.com.ar/contacto"])(
    "accepts %s for tienda.com.ar",
    (origin) => {
      expect(originMatchesDomain(origin, "tienda.com.ar")).toBe(true);
    },
  );

  it.each([
    "https://otratienda.com.ar", // suffix without a dot boundary
    "https://tienda.com.ar.evil.com",
    "http://tienda.com.ar", // plain HTTP is not allowed by default
    "not a url",
    null,
  ])("rejects %s for tienda.com.ar", (origin) => {
    expect(originMatchesDomain(origin, "tienda.com.ar")).toBe(false);
  });

  it("accepts plain HTTP when insecure origins are enabled", () => {
    expect(originMatchesDomain("http://tienda.test", "tienda.test", { allowHttp: true })).toBe(true);
  });

  it("ignores letter case", () => {
    expect(originMatchesDomain("https://WWW.Tienda.com.ar", "tienda.COM.ar")).toBe(true);
  });
});
