const SHARED_CDN = "https://ucarecdn.com";

/**
 * Public URL of an uploaded file (the bot icon). New Uploadcare projects serve files from their own
 * subdomain (xxxx.ucarecd.net): set it in NEXT_PUBLIC_UPLOAD_CARE_CDN_URL. Without it, the shared CDN.
 */
export const uploadcareUrl = (uuid: string, cdn: string | undefined = process.env.NEXT_PUBLIC_UPLOAD_CARE_CDN_URL) => {
  const base = cdn?.trim() ? cdn.trim().replace(/\/+$/, "") : SHARED_CDN;
  return `${/^https?:\/\//.test(base) ? base : `https://${base}`}/${uuid}/`;
};
