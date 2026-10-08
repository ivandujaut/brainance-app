import { describe, expect, it } from "vitest";
import {
  describeEvalSet,
  EVAL_TYPE_LABELS,
  formatEvalDate,
  formatRatio,
  meetsPublishThreshold,
  PUBLISH_THRESHOLD,
  publishableEval,
  summarizeEval,
  type EvalRow,
} from "./eval-summary";

// Spec 013, criteria 6, 7 and 11: what the landing and /como-medimos publish from an eval run.

const row = (id: string, type: string, rep: number, grade: Partial<EvalRow["grade"]> = {}, status = "ok"): EvalRow => ({
  prompt_id: id,
  rep,
  prompt: `¿Pregunta ${id}?`,
  tags: [type, "panaderia"],
  model: "anthropic/claude-haiku-4.5",
  status,
  grade: { correcta: 1, sin_invento: 1, tono: 1, ...grade },
  explanation: { correcta: `Motivo ${id}`, sin_invento: "ok", tono: "ok" },
});

const rows: EvalRow[] = [
  row("a1", "respondible", 0),
  row("a1", "respondible", 1),
  row("a2", "respondible", 0, { correcta: 0 }),
  row("a2", "respondible", 1),
  row("b1", "no_en_kb", 0),
  row("b1", "no_en_kb", 1, { sin_invento: 0, correcta: 0 }),
  row("c1", "fuera_de_tema", 0),
  row("c1", "fuera_de_tema", 1, {}, "truncated"),
];
const answers = {
  "a1#0": "Sí, a todo el país.",
  "a2#0": "Abrimos a las 8.",
  "b1#0": "No tengo ese dato.",
  "c1#0": "Solo puedo ayudarte con la panadería.",
};

describe("summarizeEval", () => {
  const summary = summarizeEval({ rows, answers, ranAt: "2026-10-08" });

  it("counts only answered rows, with the model, the cases and the repetitions", () => {
    expect(summary).toMatchObject({
      ranAt: "2026-10-08",
      model: "anthropic/claude-haiku-4.5",
      cases: 4,
      reps: 2,
      answers: 7,
    });
  });

  it("averages each metric over the answered rows", () => {
    expect(summary.metrics.correcta).toBeCloseTo(5 / 7);
    expect(summary.metrics.sinInvento).toBeCloseTo(6 / 7);
    expect(summary.metrics.tono).toBe(1);
  });

  it("breaks the results down by type of question, in a fixed order and in Spanish", () => {
    expect(summary.byType.map((t) => t.type)).toEqual(["respondible", "no_en_kb", "fuera_de_tema"]);
    expect(summary.byType[0]).toMatchObject({ label: EVAL_TYPE_LABELS.respondible, cases: 2, answers: 4 });
    expect(summary.byType[0].correcta).toBeCloseTo(3 / 4);
    expect(summary.byType[1].sinInvento).toBeCloseTo(1 / 2);
  });

  it("picks one example per type from the first repetition, including one that failed", () => {
    expect(summary.examples.map((e) => e.question)).toEqual(["¿Pregunta a2?", "¿Pregunta b1?", "¿Pregunta c1?"]);
    expect(summary.examples[0]).toMatchObject({ answer: "Abrimos a las 8.", correcta: false, reason: "Motivo a2" });
  });

  it("skips an example whose answer was not kept", () => {
    const partial = summarizeEval({ rows, answers: { "a1#0": "Sí, a todo el país." }, ranAt: "2026-10-08" });
    expect(partial.examples.map((e) => e.question)).toEqual(["¿Pregunta a1?"]);
  });
});

describe("publishing", () => {
  const base = summarizeEval({ rows: [row("a1", "respondible", 0)], answers: {}, ranAt: "2026-10-08" });
  const withMetrics = (correcta: number, sinInvento: number) => ({
    ...base,
    metrics: { correcta, sinInvento, tono: 1 },
  });

  it(`needs ${PUBLISH_THRESHOLD.sinInvento * 100}% without inventing and ${PUBLISH_THRESHOLD.correcta * 100}% correct`, () => {
    expect(meetsPublishThreshold(withMetrics(0.85, 0.95))).toBe(true);
    expect(meetsPublishThreshold(withMetrics(0.84, 0.99))).toBe(false);
    expect(meetsPublishThreshold(withMetrics(0.99, 0.94))).toBe(false);
  });

  it("publishes a valid summary over the threshold, and nothing otherwise", () => {
    expect(publishableEval({ summary: withMetrics(0.9, 0.97) })).toMatchObject({ model: "anthropic/claude-haiku-4.5" });
    expect(publishableEval({ summary: withMetrics(0.5, 0.97) })).toBeNull();
    expect(publishableEval({ summary: null })).toBeNull();
    expect(publishableEval({ summary: { model: "x" } })).toBeNull();
    expect(publishableEval(undefined)).toBeNull();
  });
});

describe("formatting", () => {
  it("shows ratios as whole percentages in Spanish", () => {
    expect(formatRatio(0.9666)).toMatch(/^97\s?%$/);
    expect(formatRatio(1)).toMatch(/^100\s?%$/);
  });

  it("shows the date of the run in words", () => {
    expect(formatEvalDate("2026-10-08")).toBe("8 de octubre de 2026");
  });
});

describe("describeEvalSet", () => {
  it("counts the questions, the businesses and the types of the set", () => {
    const set = describeEvalSet([
      { id: "a", business: "panaderia", tags: ["respondible"] },
      { id: "b", business: "panaderia", tags: ["no_en_kb"] },
      { id: "c", business: "taller", tags: ["respondible"] },
    ]);
    expect(set).toEqual({
      cases: 3,
      businesses: 2,
      types: [
        { type: "respondible", label: EVAL_TYPE_LABELS.respondible, cases: 2 },
        { type: "no_en_kb", label: EVAL_TYPE_LABELS.no_en_kb, cases: 1 },
      ],
    });
  });
});
