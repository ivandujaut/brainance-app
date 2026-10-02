/**
 * Public URL of this deployment, used in the install snippet.
 * NEXT_PUBLIC_APP_URL wins; Vercel previews fall back to their own URL.
 */
export const getAppUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  return "http://localhost:3000";
};
