import { describe, expect, it } from "vitest";
import { captureRate, dayKey, derivationRate, fillDays, formatMinutes, medianMinutes, percentile } from "./metrics";

describe("captureRate", () => {
  it("is leads over conversations that got at least one answer", () => {
    expect(captureRate({ leads: 3, answeredConversations: 12 })).toBeCloseTo(0.25);
  });

  it("is 0 without answered conversations", () => {
    expect(captureRate({ leads: 0, answeredConversations: 0 })).toBe(0);
    expect(captureRate({ leads: 2, answeredConversations: 0 })).toBe(0);
  });

  it("never exceeds 100%", () => {
    expect(captureRate({ leads: 5, answeredConversations: 3 })).toBe(1);
  });
});

describe("dayKey", () => {
  it("uses the Argentina calendar day", () => {
    // 01:30 UTC on Oct 5 is still Oct 4 in Buenos Aires (UTC-3).
    expect(dayKey(new Date("2026-10-05T01:30:00Z"))).toBe("2026-10-04");
    expect(dayKey(new Date("2026-10-05T03:30:00Z"))).toBe("2026-10-05");
  });
});

describe("fillDays", () => {
  it("returns every day of the period, oldest first, with zeros where there was nothing", () => {
    const series = fillDays(
      [
        { day: "2026-10-03", conversations: 4, leads: 1 },
        { day: "2026-10-05", conversations: 2, leads: 0 },
      ],
      { days: 3, today: "2026-10-05" },
    );
    expect(series).toEqual([
      { day: "2026-10-03", conversations: 4, leads: 1 },
      { day: "2026-10-04", conversations: 0, leads: 0 },
      { day: "2026-10-05", conversations: 2, leads: 0 },
    ]);
  });

  it("crosses month boundaries", () => {
    expect(fillDays([], { days: 3, today: "2026-11-01" }).map((d) => d.day)).toEqual([
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
    ]);
  });
});

describe("percentile", () => {
  it("uses the nearest-rank method", () => {
    const values = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    expect(percentile(values, 50)).toBe(500);
    expect(percentile(values, 95)).toBe(1000);
  });

  it("is null without values and ignores order", () => {
    expect(percentile([], 50)).toBeNull();
    expect(percentile([3, 1, 2], 50)).toBe(2);
  });
});

// Spec 011, criteria 1, 3 and 5: honesty metrics.
describe("derivationRate", () => {
  it("is derived answers over all answers", () => {
    expect(derivationRate({ answers: 40, derived: 10 })).toBeCloseTo(0.25);
  });

  it("is null without answers, so the UI shows a dash and not NaN", () => {
    expect(derivationRate({ answers: 0, derived: 0 })).toBeNull();
  });

  it("never exceeds 100%", () => {
    expect(derivationRate({ answers: 3, derived: 5 })).toBe(1);
  });
});

describe("medianMinutes", () => {
  it("is the median of the response times, in whole minutes", () => {
    expect(medianMinutes([4.2, 90, 7.6])).toBe(8);
    expect(medianMinutes([4, 90, 8, 12])).toBe(8);
  });

  it("is null without cases", () => {
    expect(medianMinutes([])).toBeNull();
  });
});

describe("formatMinutes", () => {
  it("shows minutes under an hour and hours with minutes after", () => {
    expect(formatMinutes(0)).toBe("menos de 1 min");
    expect(formatMinutes(8)).toBe("8 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(135)).toBe("2 h 15 min");
    expect(formatMinutes(2 * 24 * 60 + 60)).toBe("2 días");
  });
});
