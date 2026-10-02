import { describe, expect, it } from "vitest";
import { canSubmitLead, LEAD_LIMITS, LeadFormSchema, resolveAnswers, shouldNotifyOwner } from "./leads";

const Q1 = "6f1c7f4e-1f3a-4c8e-9a3b-2d1e0f9c8b7a";
const Q2 = "0b8e9d3c-5a7f-4e21-8c6d-1f2a3b4c5d6e";

describe("LeadFormSchema", () => {
  it("normalizes the email and drops blank answers", () => {
    expect(
      LeadFormSchema.parse({
        email: "  Ana@Example.COM ",
        answers: [
          { questionId: Q1, answer: " Rosario " },
          { questionId: Q2, answer: "  " },
        ],
      }),
    ).toEqual({ email: "ana@example.com", answers: [{ questionId: Q1, answer: "Rosario" }] });
  });

  it("works without answers", () => {
    expect(LeadFormSchema.parse({ email: "ana@example.com" })).toEqual({ email: "ana@example.com", answers: [] });
  });

  it.each(["", "ana", "ana@", "ana@example", "ana @example.com"])("rejects the email %j", (email) => {
    expect(LeadFormSchema.safeParse({ email, answers: [] }).success).toBe(false);
  });

  it("limits answers to 300 characters", () => {
    const answer = (length: number) => ({ email: "ana@example.com", answers: [{ questionId: Q1, answer: "a".repeat(length) }] });
    expect(LeadFormSchema.safeParse(answer(LEAD_LIMITS.answerLength)).success).toBe(true);
    expect(LeadFormSchema.safeParse(answer(LEAD_LIMITS.answerLength + 1)).success).toBe(false);
  });

  it("rejects malformed question ids", () => {
    expect(LeadFormSchema.safeParse({ email: "ana@example.com", answers: [{ questionId: "x", answer: "a" }] }).success).toBe(false);
  });
});

describe("resolveAnswers", () => {
  const questions = [
    { id: Q1, question: "¿De qué ciudad sos?" },
    { id: Q2, question: "¿Qué estás buscando?" },
  ];

  it("pairs each answer with the text of its question", () => {
    expect(resolveAnswers([{ questionId: Q2, answer: "Pan de masa madre" }], questions)).toEqual({
      ok: true,
      responses: [{ question: "¿Qué estás buscando?", answered: "Pan de masa madre" }],
    });
  });

  it("rejects questions that are not the site's", () => {
    expect(resolveAnswers([{ questionId: "11111111-2222-4333-8444-555555555555", answer: "x" }], questions)).toEqual({ ok: false });
  });

  it("keeps one answer per question", () => {
    const result = resolveAnswers(
      [
        { questionId: Q1, answer: "Rosario" },
        { questionId: Q1, answer: "Córdoba" },
      ],
      questions,
    );
    expect(result).toEqual({ ok: true, responses: [{ question: "¿De qué ciudad sos?", answered: "Córdoba" }] });
  });
});

describe("canSubmitLead", () => {
  it("allows 5 submissions per visitor every 10 minutes", () => {
    expect(LEAD_LIMITS.visitor).toEqual({ submissions: 5, windowMs: 10 * 60 * 1000 });
    expect(canSubmitLead(4)).toBe(true);
    expect(canSubmitLead(5)).toBe(false);
  });
});

describe("shouldNotifyOwner", () => {
  const base = { firstSubmission: true, emailEnabled: true, siteEmailsToday: 0 };

  it("emails the owner on a visitor's first submission", () => {
    expect(shouldNotifyOwner(base)).toBe(true);
  });

  it("does not email again when the visitor updates their data", () => {
    expect(shouldNotifyOwner({ ...base, firstSubmission: false })).toBe(false);
  });

  it("respects the owner's setting", () => {
    expect(shouldNotifyOwner({ ...base, emailEnabled: false })).toBe(false);
  });

  it("stops at 50 emails per site per day", () => {
    expect(LEAD_LIMITS.siteEmails).toEqual({ emails: 50, windowMs: 24 * 60 * 60 * 1000 });
    expect(shouldNotifyOwner({ ...base, siteEmailsToday: 49 })).toBe(true);
    expect(shouldNotifyOwner({ ...base, siteEmailsToday: 50 })).toBe(false);
  });
});
