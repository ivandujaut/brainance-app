import { describe, expect, it } from "vitest";
import {
  BETA_DAILY_ANSWER_MAX,
  DailyAnswerCapSchema,
  effectiveAnswerCap,
  MIN_DAILY_ANSWER_CAP,
  usageState,
} from "./answer-cap";

// Spec 011, criteria 7–9 and 12: the owner's daily answer cap and the usage shown in the panel.

describe("effectiveAnswerCap", () => {
  it("is the beta maximum when the owner set nothing", () => {
    expect(effectiveAnswerCap(null)).toBe(BETA_DAILY_ANSWER_MAX);
    expect(effectiveAnswerCap(undefined)).toBe(BETA_DAILY_ANSWER_MAX);
  });

  it("is the owner's cap when set, never above the beta maximum", () => {
    expect(effectiveAnswerCap(50)).toBe(50);
    expect(effectiveAnswerCap(BETA_DAILY_ANSWER_MAX + 100)).toBe(BETA_DAILY_ANSWER_MAX);
  });
});

describe("DailyAnswerCapSchema", () => {
  const parse = (value: unknown) => DailyAnswerCapSchema.safeParse({ dailyAnswerCap: value });

  it("accepts a whole number between the minimum and the beta maximum", () => {
    expect(parse(MIN_DAILY_ANSWER_CAP)).toMatchObject({
      success: true,
      data: { dailyAnswerCap: MIN_DAILY_ANSWER_CAP },
    });
    expect(parse("120")).toMatchObject({ success: true, data: { dailyAnswerCap: 120 } });
    expect(parse(BETA_DAILY_ANSWER_MAX)).toMatchObject({
      success: true,
      data: { dailyAnswerCap: BETA_DAILY_ANSWER_MAX },
    });
  });

  it("treats an empty value as the maximum (stored as null)", () => {
    expect(parse("")).toMatchObject({ success: true, data: { dailyAnswerCap: null } });
    expect(parse("   ")).toMatchObject({ success: true, data: { dailyAnswerCap: null } });
    expect(parse(null)).toMatchObject({ success: true, data: { dailyAnswerCap: null } });
  });

  it("rejects values out of range or not whole, with the error in Spanish", () => {
    const message = `El tope tiene que ser un número entero entre ${MIN_DAILY_ANSWER_CAP} y ${BETA_DAILY_ANSWER_MAX}.`;
    for (const value of [MIN_DAILY_ANSWER_CAP - 1, BETA_DAILY_ANSWER_MAX + 1, 0, -5, 20.5, "cien", "1e2"]) {
      const result = parse(value);
      expect(result.success, String(value)).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe(message);
    }
  });
});

describe("usageState", () => {
  it("reports what is left and how much of the cap was used", () => {
    expect(usageState({ answersToday: 12, cap: 300 })).toEqual({ remaining: 288, ratio: 0.04, reached: false });
  });

  it("is reached at the cap, with nothing left and a full bar", () => {
    expect(usageState({ answersToday: 20, cap: 20 })).toEqual({ remaining: 0, ratio: 1, reached: true });
    expect(usageState({ answersToday: 25, cap: 20 })).toEqual({ remaining: 0, ratio: 1, reached: true });
  });

  it("starts empty", () => {
    expect(usageState({ answersToday: 0, cap: 300 })).toEqual({ remaining: 300, ratio: 0, reached: false });
  });
});
