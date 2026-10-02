import { z } from "zod";

// Lead capture rules (spec 005). Shared by the widget form and the public endpoint.

export const LEAD_LIMITS = {
  answerLength: 300,
  /** Submissions per visitor in a sliding window (criterion 18). */
  visitor: { submissions: 5, windowMs: 10 * 60 * 1000 },
  /** Owner emails per site per day; leads over the cap are still stored (criterion 10). */
  siteEmails: { emails: 50, windowMs: 24 * 60 * 60 * 1000 },
} as const;

export const LeadFormSchema = z.object({
  email: z.string().trim().toLowerCase().max(254, "El email es demasiado largo.").email("Ingresá un email válido."),
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        answer: z
          .string()
          .trim()
          .max(LEAD_LIMITS.answerLength, `Cada respuesta puede tener hasta ${LEAD_LIMITS.answerLength} caracteres.`),
      }),
    )
    .max(50)
    .default([])
    .transform((answers) => answers.filter((a) => a.answer)),
});

export type LeadForm = z.output<typeof LeadFormSchema>;
export type LeadResponse = { question: string; answered: string };

/**
 * Pairs answers with the text of the site's questions. The text is copied so an answer keeps its
 * meaning if the owner later edits or deletes the question. Unknown ids reject the whole submission.
 */
export const resolveAnswers = (
  answers: LeadForm["answers"],
  questions: readonly { id: string; question: string }[],
): { ok: true; responses: LeadResponse[] } | { ok: false } => {
  const byId = new Map(questions.map((q) => [q.id, q.question]));
  const latest = new Map<string, string>();
  for (const { questionId, answer } of answers) {
    if (!byId.has(questionId)) return { ok: false };
    latest.set(questionId, answer);
  }
  return {
    ok: true,
    responses: [...latest].map(([id, answered]) => ({ question: byId.get(id)!, answered })),
  };
};

export const canSubmitLead = (visitorRecentSubmissions: number) =>
  visitorRecentSubmissions < LEAD_LIMITS.visitor.submissions;

/** Only a visitor's first submission emails the owner, if enabled and under the site's daily cap. */
export const shouldNotifyOwner = (input: { firstSubmission: boolean; emailEnabled: boolean; siteEmailsToday: number }) =>
  input.firstSubmission && input.emailEnabled && input.siteEmailsToday < LEAD_LIMITS.siteEmails.emails;
