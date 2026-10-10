// Site and bot icons behind an interface (ADR 0011): Vercel Blob today, another store tomorrow.
import { put } from "@vercel/blob";
import { checkIcon, ICON_ERROR, MAX_ICON_BYTES, type IconType } from "@/domain/icon";
import { captureError } from "@/server/observability";

export type Icon = { bytes: Uint8Array; type: IconType };

export interface IconStore {
  /** Stores the icon and returns its public URL. */
  save(icon: Icon): Promise<string>;
}

type Put = (pathname: string, body: Buffer, options: Parameters<typeof put>[2]) => Promise<{ url: string }>;

export const vercelBlobIconStore = (token: string, upload: Put = put): IconStore => ({
  async save({ bytes, type }) {
    const blob = await upload(`icons/icon.${type.extension}`, Buffer.from(bytes), {
      access: "public",
      addRandomSuffix: true,
      contentType: type.contentType,
      token,
    });
    return blob.url;
  },
});

const missingToken: IconStore = {
  async save() {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing: connect a Vercel Blob store to the project (ADR 0011)");
  },
};

type Env = Record<string, string | undefined>;

export const resolveIconStore = (env: Env = process.env, upload?: Put): IconStore =>
  env.BLOB_READ_WRITE_TOKEN ? vercelBlobIconStore(env.BLOB_READ_WRITE_TOKEN, upload) : missingToken;

const UPLOAD_FAILED = "No pudimos subir la imagen. Probá de nuevo.";

/** Checks what the browser sent (a form field) and stores it. Never throws: the form shows the message. */
export const uploadIcon = async (
  input: unknown,
  store: IconStore = resolveIconStore(),
  onError: (error: unknown) => void = (error) => captureError(error, { area: "settings" }),
): Promise<{ url: string } | { error: string }> => {
  if (!(input instanceof File) || input.size > MAX_ICON_BYTES) return { error: ICON_ERROR };
  const bytes = new Uint8Array(await input.arrayBuffer());
  const checked = checkIcon(bytes);
  if (!checked.ok) return { error: checked.error };
  try {
    return { url: await store.save({ bytes, type: checked.type }) };
  } catch (error) {
    onError(error);
    return { error: UPLOAD_FAILED };
  }
};
