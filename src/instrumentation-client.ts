import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "./sentry.shared";

// Sentry in the browser (dashboard and the widget iframe, never the customer's page), only when
// NEXT_PUBLIC_SENTRY_DSN is set. The DSN is not a secret.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) Sentry.init(sentryOptions(dsn));

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
