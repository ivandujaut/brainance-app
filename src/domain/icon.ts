// Site and bot icons (ADR 0011): what the upload accepts and which stored URLs the pages show.

export const MAX_ICON_BYTES = 2 * 1024 * 1024;
export const ICON_ERROR = "El ícono tiene que ser PNG o JPG de hasta 2 MB.";

export type IconType = { contentType: "image/png" | "image/jpeg"; extension: "png" | "jpg" };

const SIGNATURES: { head: number[]; type: IconType }[] = [
  { head: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], type: { contentType: "image/png", extension: "png" } },
  { head: [0xff, 0xd8, 0xff], type: { contentType: "image/jpeg", extension: "jpg" } },
];

/** Decides the type from the file's first bytes, never from the name or what the browser reports. */
export const checkIcon = (bytes: Uint8Array): { ok: true; type: IconType } | { ok: false; error: string } => {
  if (bytes.length > MAX_ICON_BYTES) return { ok: false, error: ICON_ERROR };
  const match = SIGNATURES.find(({ head }) => head.every((byte, i) => bytes[i] === byte));
  return match ? { ok: true, type: match.type } : { ok: false, error: ICON_ERROR };
};

const STORE_HOST = /^[a-z0-9]+\.public\.blob\.vercel-storage\.com$/i;

/** A URL our upload produced: a public Vercel Blob file under icons/. */
export const isStoredIconUrl = (value: string) => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === "https:" && STORE_HOST.test(url.hostname) && url.pathname.startsWith("/icons/");
};

/** The icon to show, or null for the site's initial (also for Uploadcare ids saved before ADR 0011). */
export const iconSrc = (value: string | null | undefined) => (value && isStoredIconUrl(value) ? value : null);
