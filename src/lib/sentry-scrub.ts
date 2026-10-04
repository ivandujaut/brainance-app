// Nothing a visitor or owner wrote reaches Sentry (spec 007, criterion 3). Used as `beforeSend`
// on the server, the edge and the browser.

const PERSONAL_KEYS = new Set(["text", "message", "email", "answers", "body", "question", "answered", "content", "reply"]);
const SENSITIVE_HEADERS = new Set(["cookie", "authorization", "x-forwarded-for", "x-real-ip"]);
const REDACTED = "[redacted]";

const redact = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, v]) => [key, PERSONAL_KEYS.has(key) ? REDACTED : redact(v)]),
  );
};

type ScrubbableEvent = {
  request?: { headers?: Record<string, string>; data?: unknown; cookies?: unknown; query_string?: unknown; [key: string]: unknown };
  user?: { id?: string | number; [key: string]: unknown };
  extra?: Record<string, unknown>;
  contexts?: Record<string, unknown>;
  breadcrumbs?: { data?: Record<string, unknown>; [key: string]: unknown }[];
  [key: string]: unknown;
};

export const scrubEvent = <T extends object>(input: T): T => {
  const event = input as ScrubbableEvent;
  const scrubbed: ScrubbableEvent = { ...event };
  if (event.request) {
    // Query strings carry the visitorId, which works as a credential (ADR 0003).
    const { data: _data, cookies: _cookies, query_string: _query, headers, ...rest } = event.request;
    scrubbed.request = {
      ...rest,
      ...(headers && {
        headers: Object.fromEntries(Object.entries(headers).filter(([name]) => !SENSITIVE_HEADERS.has(name.toLowerCase()))),
      }),
    };
  }
  if (event.user) scrubbed.user = event.user.id === undefined ? {} : { id: event.user.id };
  if (event.extra) scrubbed.extra = redact(event.extra) as Record<string, unknown>;
  if (event.contexts) scrubbed.contexts = redact(event.contexts) as Record<string, unknown>;
  if (event.breadcrumbs) {
    scrubbed.breadcrumbs = event.breadcrumbs.map((b) => (b.data ? { ...b, data: redact(b.data) as Record<string, unknown> } : b));
  }
  return scrubbed as T;
};
