// Cost and abuse limits for the public widget endpoint (ADR 0003).
export const MAX_MESSAGE_LENGTH = 1000;
export const VISITOR_LIMIT = { messages: 20, windowMs: 10 * 60 * 1000 };
export const SITE_DAILY_LIMIT = { messages: 300, windowMs: 24 * 60 * 60 * 1000 };
/** Messages of context sent to the model with each new question. */
export const HISTORY_WINDOW = 10;

export type RejectReason = "empty" | "too_long" | "visitor_rate" | "site_cap";

export type IncomingCheck = { ok: true; text: string } | { ok: false; reason: RejectReason };

/** Decides whether a visitor message may be answered by the model, given recent usage counts. */
export const checkIncomingMessage = (
  raw: string,
  usage: { visitorRecent: number; siteDaily: number },
): IncomingCheck => {
  const text = raw.trim();
  if (!text) return { ok: false, reason: "empty" };
  if (text.length > MAX_MESSAGE_LENGTH) return { ok: false, reason: "too_long" };
  if (usage.visitorRecent >= VISITOR_LIMIT.messages) return { ok: false, reason: "visitor_rate" };
  if (usage.siteDaily >= SITE_DAILY_LIMIT.messages) return { ok: false, reason: "site_cap" };
  return { ok: true, text };
};

type Turn = { role: "user" | "assistant"; content: string };

/** The last HISTORY_WINDOW messages, starting on a visitor message so the model sees a well-formed turn order. */
export const recentHistory = <T extends Turn>(messages: readonly T[]): T[] => {
  const window = messages.slice(-HISTORY_WINDOW);
  const firstUser = window.findIndex((m) => m.role === "user");
  return firstUser === -1 ? [] : window.slice(firstUser);
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Visitor ids are random UUIDs generated in the visitor's browser; they act as a bearer credential. */
export const isVisitorId = (value: unknown): value is string => typeof value === "string" && UUID.test(value);
