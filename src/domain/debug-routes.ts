type Env = Partial<Record<"VERCEL_ENV" | "NODE_ENV", string>>;

/** Test-only routes (like /api/debug/sentry) exist in Vercel previews and local development, never in production. */
export const debugRoutesEnabled = ({ VERCEL_ENV, NODE_ENV }: Env) =>
  VERCEL_ENV ? VERCEL_ENV === "preview" : NODE_ENV === "development";
