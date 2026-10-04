import * as Sentry from "@sentry/nextjs";

// Sentry on the server and the edge, only when SENTRY_DSN is set (ADR 0008).
export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  const { sentryOptions } = await import("./sentry.shared");
  Sentry.init(sentryOptions(dsn));
}

export const onRequestError = Sentry.captureRequestError;
