import type { ErrorEvent } from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

// Shared Sentry options (ADR 0008): no default PII, no tracing or replay for now, scrubbed events.
export const sentryOptions = (dsn: string | undefined) => ({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: (event: ErrorEvent) => scrubEvent(event),
});
