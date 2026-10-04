import * as Sentry from "@sentry/nextjs";

// Error reporting behind one interface (ADR 0008): Sentry when SENTRY_DSN is set, the console
// otherwise. Never pass conversation text, emails or answers in `extra` (they are also scrubbed).

export type Area = "widget" | "ai" | "email" | "realtime" | "leads" | "inbox" | "settings";

type Context = { area: Area; domainId?: string; extra?: Record<string, unknown> };

const tags = ({ area, domainId }: Context) => ({ area, ...(domainId && { domainId }) });

export const captureError = (error: unknown, context: Context) => {
  if (Sentry.isInitialized()) {
    Sentry.captureException(error, { tags: tags(context), extra: context.extra });
  } else {
    console.error(`[${context.area}]`, error, context.extra ?? "");
  }
};

export const captureWarning = (message: string, context: Context) => {
  if (Sentry.isInitialized()) {
    Sentry.captureMessage(message, { level: "warning", tags: tags(context), extra: context.extra });
  } else {
    console.warn(`[${context.area}] ${message}`, context.extra ?? "");
  }
};
