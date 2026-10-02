import { describe, expect, it } from "vitest";
import {
  HISTORY_WINDOW,
  isVisitorId,
  MAX_MESSAGE_LENGTH,
  SITE_DAILY_LIMIT,
  checkIncomingMessage,
  recentHistory,
  VISITOR_LIMIT,
} from "./widget-limits";

const usage = { visitorRecent: 0, siteDaily: 0 };

describe("checkIncomingMessage", () => {
  it("accepts a normal message", () => {
    expect(checkIncomingMessage("¿Hacen envíos?", usage)).toEqual({ ok: true, text: "¿Hacen envíos?" });
  });

  it("trims the message and rejects empty ones", () => {
    expect(checkIncomingMessage("  hola  ", usage)).toEqual({ ok: true, text: "hola" });
    expect(checkIncomingMessage("   ", usage)).toEqual({ ok: false, reason: "empty" });
  });

  it(`rejects messages longer than ${MAX_MESSAGE_LENGTH} characters`, () => {
    expect(checkIncomingMessage("a".repeat(MAX_MESSAGE_LENGTH), usage).ok).toBe(true);
    expect(checkIncomingMessage("a".repeat(MAX_MESSAGE_LENGTH + 1), usage)).toEqual({ ok: false, reason: "too_long" });
  });

  it(`rate-limits a visitor after ${VISITOR_LIMIT.messages} messages in the window`, () => {
    expect(checkIncomingMessage("hola", { ...usage, visitorRecent: VISITOR_LIMIT.messages - 1 }).ok).toBe(true);
    expect(checkIncomingMessage("hola", { ...usage, visitorRecent: VISITOR_LIMIT.messages })).toEqual({
      ok: false,
      reason: "visitor_rate",
    });
  });

  it(`stops answering with the model after ${SITE_DAILY_LIMIT.messages} messages per site per day`, () => {
    expect(checkIncomingMessage("hola", { ...usage, siteDaily: SITE_DAILY_LIMIT.messages - 1 }).ok).toBe(true);
    expect(checkIncomingMessage("hola", { ...usage, siteDaily: SITE_DAILY_LIMIT.messages })).toEqual({
      ok: false,
      reason: "site_cap",
    });
  });

  it("checks the visitor limit before the site cap", () => {
    expect(
      checkIncomingMessage("hola", { visitorRecent: VISITOR_LIMIT.messages, siteDaily: SITE_DAILY_LIMIT.messages }),
    ).toEqual({ ok: false, reason: "visitor_rate" });
  });
});

describe("recentHistory", () => {
  const conversation = (length: number) =>
    Array.from({ length }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: `m${i}` }) as const);

  it(`keeps only the last ${HISTORY_WINDOW} messages`, () => {
    const history = recentHistory(conversation(16));
    expect(history).toHaveLength(HISTORY_WINDOW);
    expect(history.at(-1)?.content).toBe("m15");
  });

  it("starts the window on a visitor message", () => {
    // The last 10 of 15 start with an assistant reply (m5), which is dropped.
    const history = recentHistory(conversation(15));
    expect(history[0]).toEqual({ role: "user", content: "m6" });
    expect(history).toHaveLength(HISTORY_WINDOW - 1);
  });

  it("returns everything for short conversations", () => {
    expect(recentHistory(conversation(3))).toHaveLength(3);
  });
});

describe("isVisitorId", () => {
  it("accepts a random UUID", () => {
    expect(isVisitorId(crypto.randomUUID())).toBe(true);
  });

  it.each(["", "abc", "1234", "../../etc", null, undefined])("rejects %j", (value) => {
    expect(isVisitorId(value)).toBe(false);
  });
});
