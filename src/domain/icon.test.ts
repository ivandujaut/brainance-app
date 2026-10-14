import { describe, expect, it } from "vitest";
import { checkIcon, ICON_UPLOAD_LIMITS, iconSrc, iconUploadProblem, isStoredIconUrl, MAX_ICON_BYTES } from "./icon";

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const bytes = (head: number[], size = 64) => {
  const data = new Uint8Array(size);
  data.set(head);
  return data;
};

const STORED = "https://abc123xyz.public.blob.vercel-storage.com/icons/icon-Xy9aBc.png";

describe("checkIcon", () => {
  it("accepts a PNG and a JPEG by their first bytes", () => {
    expect(checkIcon(bytes(PNG))).toEqual({ ok: true, type: { contentType: "image/png", extension: "png" } });
    expect(checkIcon(bytes(JPEG))).toEqual({ ok: true, type: { contentType: "image/jpeg", extension: "jpg" } });
  });

  it("rejects anything else, whatever the browser called it", () => {
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    const gif = bytes([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    for (const file of [svg, gif, new Uint8Array(0), bytes([0x89, 0x50])]) {
      expect(checkIcon(file)).toEqual({ ok: false, error: "El ícono tiene que ser PNG o JPG de hasta 2 MB." });
    }
  });

  it("rejects files over 2 MB", () => {
    expect(checkIcon(bytes(PNG, MAX_ICON_BYTES))).toMatchObject({ ok: true });
    expect(checkIcon(bytes(PNG, MAX_ICON_BYTES + 1))).toMatchObject({ ok: false });
  });
});

describe("isStoredIconUrl", () => {
  it("accepts a public Vercel Blob URL under icons/", () => {
    expect(isStoredIconUrl(STORED)).toBe(true);
  });

  it("rejects other hosts, other folders, plain http and legacy Uploadcare ids", () => {
    for (const value of [
      "https://evil.example.com/icons/icon.png",
      "https://abc.public.blob.vercel-storage.com.evil.com/icons/icon.png",
      "https://abc123xyz.public.blob.vercel-storage.com/audios/a.ogg",
      "http://abc123xyz.public.blob.vercel-storage.com/icons/icon.png",
      "https://abc123xyz.private.blob.vercel-storage.com/icons/icon.png",
      "3f1c2a9e-5b7d-4e8f-9a0b-1c2d3e4f5a6b",
      "",
      "not a url",
    ]) {
      expect(isStoredIconUrl(value), value).toBe(false);
    }
  });
});

describe("isStoredIconUrl with the project's store", () => {
  it("accepts only that store's host, in any case", () => {
    expect(isStoredIconUrl(STORED, "abc123xyz.public.blob.vercel-storage.com")).toBe(true);
    expect(isStoredIconUrl(STORED, "ABC123XYZ.public.blob.vercel-storage.com")).toBe(true);
    expect(isStoredIconUrl(STORED, "otro999.public.blob.vercel-storage.com")).toBe(false);
  });
});

describe("iconUploadProblem", () => {
  it("lets an owner upload up to the daily limit", () => {
    expect(iconUploadProblem({ ownerToday: 0, allThisMonth: 0 })).toBeNull();
    expect(iconUploadProblem({ ownerToday: ICON_UPLOAD_LIMITS.perOwnerPerDay - 1, allThisMonth: 0 })).toBeNull();
  });

  it("stops an owner at the daily limit", () => {
    expect(iconUploadProblem({ ownerToday: ICON_UPLOAD_LIMITS.perOwnerPerDay, allThisMonth: 0 })).toEqual({
      scope: "owner",
      message: "Llegaste al máximo de íconos que se pueden subir por día. Probá mañana.",
    });
  });

  it("stops everyone before the store reaches its monthly quota", () => {
    expect(iconUploadProblem({ ownerToday: 0, allThisMonth: ICON_UPLOAD_LIMITS.allPerMonth })).toEqual({
      scope: "all",
      message: "No podemos subir más íconos por ahora. Probá en unos días.",
    });
  });

  it("keeps the worst case under the Hobby plan: 1 GB stored and 2,000 uploads a month (ADR 0011)", () => {
    expect(ICON_UPLOAD_LIMITS.allPerMonth * MAX_ICON_BYTES).toBeLessThan(1024 ** 3);
    expect(ICON_UPLOAD_LIMITS.allPerMonth).toBeLessThan(2000);
  });
});

describe("iconSrc", () => {
  it("returns what the page can show, or null for the initial", () => {
    expect(iconSrc(STORED)).toBe(STORED);
    expect(iconSrc("3f1c2a9e-5b7d-4e8f-9a0b-1c2d3e4f5a6b")).toBeNull(); // Uploadcare, before ADR 0011
    expect(iconSrc("")).toBeNull();
    expect(iconSrc(null)).toBeNull();
    expect(iconSrc(undefined)).toBeNull();
  });
});
