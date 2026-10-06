import { describe, expect, it } from "vitest";
import { uploadcareUrl } from "./uploadcare";

const uuid = "0f1e2d3c-4b5a-4968-8776-655443322110";

// New Uploadcare projects serve files from their own subdomain (xxxx.ucarecd.net), not ucarecdn.com.
describe("uploadcareUrl", () => {
  it("uses the project's CDN when configured", () => {
    expect(uploadcareUrl(uuid, "https://4gj75fw3od.ucarecd.net")).toBe(`https://4gj75fw3od.ucarecd.net/${uuid}/`);
  });

  it("accepts the CDN with a trailing slash or without protocol", () => {
    expect(uploadcareUrl(uuid, "https://4gj75fw3od.ucarecd.net/")).toBe(`https://4gj75fw3od.ucarecd.net/${uuid}/`);
    expect(uploadcareUrl(uuid, "4gj75fw3od.ucarecd.net")).toBe(`https://4gj75fw3od.ucarecd.net/${uuid}/`);
  });

  it("falls back to the shared CDN", () => {
    expect(uploadcareUrl(uuid, undefined)).toBe(`https://ucarecdn.com/${uuid}/`);
    expect(uploadcareUrl(uuid, "")).toBe(`https://ucarecdn.com/${uuid}/`);
  });
});
