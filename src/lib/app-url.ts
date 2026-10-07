/**
 * Public URL of this deployment, used in the install snippet and in the links of owner emails.
 * NEXT_PUBLIC_APP_URL wins. Vercel previews use the branch URL: it outlives each deploy and keeps
 * the owner's session, unlike the deployment's unique URL (spec 010, QA on the preview).
 */
export const getAppUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`;
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  return "http://localhost:3000";
};
