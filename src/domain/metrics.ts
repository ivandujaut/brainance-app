// Metrics helpers for the owner's dashboard and the admin page (spec 007).

export const TIME_ZONE = "America/Argentina/Buenos_Aires";

/** Leads over conversations that got at least one answer, between 0 and 1. */
export const captureRate = ({ leads, answeredConversations }: { leads: number; answeredConversations: number }) =>
  answeredConversations > 0 ? Math.min(1, leads / answeredConversations) : 0;

const dayFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });

/** Calendar day in Argentina, as YYYY-MM-DD. */
export const dayKey = (date: Date) => dayFormat.format(date);

export type DayPoint = { day: string; conversations: number; leads: number };

const shiftDay = (day: string, delta: number) => {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
};

/** The last `days` days up to `today`, oldest first, with zeros for days without data. */
export const fillDays = (points: readonly DayPoint[], { days, today }: { days: number; today: string }): DayPoint[] => {
  const byDay = new Map(points.map((p) => [p.day, p]));
  return Array.from({ length: days }, (_, i) => {
    const day = shiftDay(today, i - days + 1);
    return byDay.get(day) ?? { day, conversations: 0, leads: 0 };
  });
};

/** Nearest-rank percentile, or null without values. */
export const percentile = (values: readonly number[], p: number) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)];
};
