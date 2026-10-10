import { describe, expect, it, vi } from "vitest";
import { MAX_ICON_BYTES } from "@/domain/icon";
import { resolveIconStore, uploadIcon, vercelBlobIconStore, type IconStore } from "./icons";

const png = { bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47]), type: { contentType: "image/png", extension: "png" } as const };

describe("vercelBlobIconStore", () => {
  it("puts the icon under icons/ as a public file with a random suffix", async () => {
    const url = "https://abc.public.blob.vercel-storage.com/icons/icon-Xy9.png";
    const put = vi.fn().mockResolvedValue({ url });
    await expect(vercelBlobIconStore("vercel_blob_rw_test", put).save(png)).resolves.toBe(url);
    expect(put).toHaveBeenCalledWith("icons/icon.png", Buffer.from(png.bytes), {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/png",
      token: "vercel_blob_rw_test",
    });
  });
});

describe("resolveIconStore", () => {
  it("fails explicitly without the Blob token", async () => {
    await expect(resolveIconStore({}).save(png)).rejects.toThrow(/BLOB_READ_WRITE_TOKEN/);
  });

  it("uses Vercel Blob when the token is set", async () => {
    const put = vi.fn().mockResolvedValue({ url: "https://abc.public.blob.vercel-storage.com/icons/x.png" });
    await resolveIconStore({ BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_x" }, put).save(png);
    expect(put).toHaveBeenCalledOnce();
  });
});

describe("uploadIcon", () => {
  const STORED = "https://abc.public.blob.vercel-storage.com/icons/icon-Xy9.png";
  const store = (): IconStore & { save: ReturnType<typeof vi.fn> } => ({ save: vi.fn().mockResolvedValue(STORED) });
  const file = (head: number[], size = 64, type = "image/png") => {
    const data = new Uint8Array(size);
    data.set(head);
    return new File([data], "logo.png", { type });
  };
  const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  it("stores a valid image and returns its URL", async () => {
    const icons = store();
    await expect(uploadIcon(file(PNG), icons)).resolves.toEqual({ url: STORED });
    expect(icons.save).toHaveBeenCalledWith({
      bytes: expect.any(Uint8Array),
      type: { contentType: "image/png", extension: "png" },
    });
  });

  it("rejects a missing file, a file that only claims to be an image and a big one, without storing", async () => {
    const icons = store();
    const svg = new File(["<svg/>"], "logo.png", { type: "image/png" });
    for (const input of [null, "texto", svg, file(PNG, MAX_ICON_BYTES + 1)]) {
      await expect(uploadIcon(input, icons)).resolves.toEqual({ error: "El ícono tiene que ser PNG o JPG de hasta 2 MB." });
    }
    expect(icons.save).not.toHaveBeenCalled();
  });

  it("returns a retry message when the store fails", async () => {
    const icons: IconStore = { save: vi.fn().mockRejectedValue(new Error("blob down")) };
    const onError = vi.fn();
    await expect(uploadIcon(file(PNG), icons, onError)).resolves.toEqual({
      error: "No pudimos subir la imagen. Probá de nuevo.",
    });
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });
});
