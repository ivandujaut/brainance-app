import { z } from "zod";

// The site's daily answer cap (spec 011): the beta maximum, the owner's lower cap, and the usage
// the panel shows. "Answers" are bot replies in the last 24 hours, the same number the widget
// endpoint counts before calling the model (criterion 9).

export const BETA_DAILY_ANSWER_MAX = 300;
export const MIN_DAILY_ANSWER_CAP = 20;

/** The cap in force for a site: the owner's, or the beta maximum when unset. */
export const effectiveAnswerCap = (configured: number | null | undefined) =>
  configured ? Math.min(configured, BETA_DAILY_ANSWER_MAX) : BETA_DAILY_ANSWER_MAX;

const RANGE_ERROR = `El tope tiene que ser un número entero entre ${MIN_DAILY_ANSWER_CAP} y ${BETA_DAILY_ANSWER_MAX}.`;

/** The owner's input: blank means "the maximum" and is stored as null. */
export const DailyAnswerCapSchema = z.object({
  dailyAnswerCap: z.preprocess(
    (value) => {
      if (value === null || value === undefined) return null;
      if (typeof value === "string") {
        const text = value.trim();
        return text === "" ? null : /^\d+$/.test(text) ? Number(text) : NaN;
      }
      return value;
    },
    z
      .number({ invalid_type_error: RANGE_ERROR })
      .int(RANGE_ERROR)
      .min(MIN_DAILY_ANSWER_CAP, RANGE_ERROR)
      .max(BETA_DAILY_ANSWER_MAX, RANGE_ERROR)
      .nullable(),
  ),
});

export type DailyAnswerCapInput = z.input<typeof DailyAnswerCapSchema>;

export type UsageState = { remaining: number; ratio: number; reached: boolean };

/** How much of the day's cap is used, for the progress bar and the "reached" notice. */
export const usageState = ({ answersToday, cap }: { answersToday: number; cap: number }): UsageState => {
  const remaining = Math.max(0, cap - answersToday);
  return { remaining, ratio: cap > 0 ? Math.min(1, answersToday / cap) : 1, reached: answersToday >= cap };
};
