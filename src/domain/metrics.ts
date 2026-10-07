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

// Spec 011: honesty metrics.

/** Derived answers over all the bot's answers, or null without answers (the UI shows a dash, not 0%). */
export const derivationRate = ({ answers, derived }: { answers: number; derived: number }) =>
  answers > 0 ? Math.min(1, derived / answers) : null;

/** The median of the owner's response times, in whole minutes, or null without cases. */
export const medianMinutes = (values: readonly number[]) => {
  const median = percentile(values, 50);
  return median === null ? null : Math.round(median);
};

/** Minutes as the owner reads them: "8 min", "2 h 15 min", "2 días". */
export const formatMinutes = (minutes: number) => {
  const whole = Math.round(minutes);
  if (whole < 1) return "menos de 1 min";
  if (whole < 60) return `${whole} min`;
  const hours = Math.floor(whole / 60);
  if (hours >= 48) return `${Math.floor(hours / 24)} días`;
  const rest = whole % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
};
