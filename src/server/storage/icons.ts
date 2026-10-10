// Site and bot icons behind an interface (ADR 0011): Vercel Blob today, another store tomorrow.
import { put } from "@vercel/blob";
import { checkIcon, ICON_ERROR, isStoredIconUrl, MAX_ICON_BYTES, type IconType } from "@/domain/icon";
import { captureError } from "@/server/observability";

export type Icon = { bytes: Uint8Array; type: IconType };

export interface IconStore {
  /** Stores the icon and returns its public URL. */
  save(icon: Icon): Promise<string>;
}

type Put = (pathname: string, body: Buffer, options: Parameters<typeof put>[2]) => Promise<{ url: string }>;

// Credentials come from the environment: BLOB_STORE_ID with Vercel's OIDC token, or BLOB_READ_WRITE_TOKEN.
export const vercelBlobIconStore = (upload: Put = put): IconStore => ({
  async save({ bytes, type }) {
    const blob = await upload(`icons/icon.${type.extension}`, Buffer.from(bytes), {
      access: "public",
      addRandomSuffix: true,
      contentType: type.contentType,
    });
    return blob.url;
  },
});

type Env = Record<string, string | undefined>;

/** Host of the connected store's public files, or null when no store is connected. */
export const blobStoreHost = (env: Env = process.env) => {
  // Same parsing as @vercel/blob: "store_<id>" in BLOB_STORE_ID, "vercel_blob_rw_<id>_<secret>" in the token.
  const storeId = env.BLOB_STORE_ID?.trim().replace(/^store_/, "") || env.BLOB_READ_WRITE_TOKEN?.split("_")[3];
  return storeId ? `${storeId.toLowerCase()}.public.blob.vercel-storage.com` : null;
};

/** An icon URL the actions may save: a file our upload put in the project's store. */
export const isOwnIconUrl = (value: string, env: Env = process.env) => {
  const host = blobStoreHost(env);
  return host !== null && isStoredIconUrl(value, host);
};

const noStore: IconStore = {
  async save() {
    throw new Error("No Vercel Blob store is connected: set BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN (ADR 0011)");
  },
};

export const resolveIconStore = (env: Env = process.env, upload?: Put): IconStore =>
  blobStoreHost(env) ? vercelBlobIconStore(upload) : noStore;

/** Counts an upload against the caps (ADR 0011). Returns why it can't go ahead, or null once it's counted. */
export type UploadQuota = { reserve(): Promise<string | null> };

const UPLOAD_FAILED = "No pudimos subir la imagen. Probá de nuevo.";

type UploadOptions = { quota: UploadQuota; store?: IconStore; onError?: (error: unknown) => void };

/** Checks what the browser sent (a form field) and stores it. Never throws: the form shows the message. */
export const uploadIcon = async (
  input: unknown,
  {
    quota,
    store = resolveIconStore(),
    onError = (error) => captureError(error, { area: "settings" }),
  }: UploadOptions,
): Promise<{ url: string } | { error: string }> => {
  if (!(input instanceof File) || input.size > MAX_ICON_BYTES) return { error: ICON_ERROR };
  const bytes = new Uint8Array(await input.arrayBuffer());
  const checked = checkIcon(bytes);
  if (!checked.ok) return { error: checked.error };
  try {
    const capped = await quota.reserve();
    if (capped) return { error: capped };
    return { url: await store.save({ bytes, type: checked.type }) };
  } catch (error) {
    onError(error);
    return { error: UPLOAD_FAILED };
  }
};
