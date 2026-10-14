import { describe, expect, it, vi } from "vitest";
import { MAX_ICON_BYTES } from "@/domain/icon";
import { blobStoreHost, isOwnIconUrl, resolveIconStore, uploadIcon, vercelBlobIconStore, type IconStore } from "./icons";

const png = { bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47]), type: { contentType: "image/png", extension: "png" } as const };
const STORED = "https://abc123xyz.public.blob.vercel-storage.com/icons/icon-Xy9.png";

describe("vercelBlobIconStore", () => {
  it("puts the icon under icons/ as a public file with a random suffix", async () => {
    const put = vi.fn().mockResolvedValue({ url: STORED });
    await expect(vercelBlobIconStore(put).save(png)).resolves.toBe(STORED);
    // No token: the SDK takes BLOB_STORE_ID with OIDC, or BLOB_READ_WRITE_TOKEN, from the environment.
    expect(put).toHaveBeenCalledWith("icons/icon.png", Buffer.from(png.bytes), {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/png",
    });
  });
});

describe("blobStoreHost", () => {
  it("reads the store from BLOB_STORE_ID or from the read-write token", () => {
    expect(blobStoreHost({ BLOB_STORE_ID: "store_AbC123xyz" })).toBe("abc123xyz.public.blob.vercel-storage.com");
    expect(blobStoreHost({ BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_AbC123xyz_s3cr3t" })).toBe(
      "abc123xyz.public.blob.vercel-storage.com",
    );
    expect(blobStoreHost({})).toBeNull();
  });
});

describe("isOwnIconUrl", () => {
  const env = { BLOB_STORE_ID: "store_abc123xyz" };

  it("accepts only icons from the project's store", () => {
    expect(isOwnIconUrl(STORED, env)).toBe(true);
    expect(isOwnIconUrl("https://otro999.public.blob.vercel-storage.com/icons/icon.gif", env)).toBe(false);
  });

  it("accepts nothing when no store is connected", () => {
    expect(isOwnIconUrl(STORED, {})).toBe(false);
  });
});

describe("resolveIconStore", () => {
  it("fails explicitly when no store is connected", async () => {
    await expect(resolveIconStore({}).save(png)).rejects.toThrow(/Blob store/);
  });

  it("uses Vercel Blob when a store is connected", async () => {
    const put = vi.fn().mockResolvedValue({ url: STORED });
    await resolveIconStore({ BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_abc123xyz_x" }, put).save(png);
    expect(put).toHaveBeenCalledOnce();
  });
});

describe("uploadIcon", () => {
  const store = (): IconStore & { save: ReturnType<typeof vi.fn> } => ({ save: vi.fn().mockResolvedValue(STORED) });
  const open = { reserve: vi.fn().mockResolvedValue(null) };
  const file = (head: number[], size = 64, type = "image/png") => {
    const data = new Uint8Array(size);
    data.set(head);
    return new File([data], "logo.png", { type });
  };
  const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  it("stores a valid image and returns its URL", async () => {
    const icons = store();
    await expect(uploadIcon(file(PNG), { store: icons, quota: open })).resolves.toEqual({ url: STORED });
    expect(icons.save).toHaveBeenCalledWith({
      bytes: expect.any(Uint8Array),
      type: { contentType: "image/png", extension: "png" },
    });
  });

  it("rejects a missing file, a file that only claims to be an image and a big one, before the quota", async () => {
    const icons = store();
    const quota = { reserve: vi.fn() };
    const svg = new File(["<svg/>"], "logo.png", { type: "image/png" });
    for (const input of [null, "texto", svg, file(PNG, MAX_ICON_BYTES + 1)]) {
      await expect(uploadIcon(input, { store: icons, quota })).resolves.toEqual({
        error: "El ícono tiene que ser PNG o JPG de hasta 2 MB.",
      });
    }
    expect(quota.reserve).not.toHaveBeenCalled();
    expect(icons.save).not.toHaveBeenCalled();
  });

  it("does not store anything over the upload cap", async () => {
    const icons = store();
    const quota = { reserve: vi.fn().mockResolvedValue("Llegaste al máximo.") };
    await expect(uploadIcon(file(PNG), { store: icons, quota })).resolves.toEqual({ error: "Llegaste al máximo." });
    expect(icons.save).not.toHaveBeenCalled();
  });

  it("returns a retry message when the store fails", async () => {
    const icons: IconStore = { save: vi.fn().mockRejectedValue(new Error("blob down")) };
    const onError = vi.fn();
    await expect(uploadIcon(file(PNG), { store: icons, quota: open, onError })).resolves.toEqual({
      error: "No pudimos subir la imagen. Probá de nuevo.",
    });
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });
});
