import { z } from "zod";

// What the landing and /como-medimos publish from a run of the answers eval (spec 013). The run's
// rows come from evals/rag-answers/<flow>/<variant>/results.jsonl; the bot's answers from its traces.

/** Types of question in the eval set, in the order the pages list them. */
export const EVAL_TYPE_LABELS = {
  respondible: "La respuesta está cargada",
  no_en_kb: "El dato no está cargado",
  multiple: "Varias preguntas juntas",
  premisa_falsa: "Dan por cierto algo falso",
  fuera_de_tema: "Fuera de tema o intentos de manipularlo",
  historial: "Siguen una conversación anterior",
} as const;

/**
 * Spec 013, decision 4: the eval is published only from these scores up. Spec 016, criterion 8:
 * the promise's own case ("El dato no está cargado") has its own threshold.
 */
export const PUBLISH_THRESHOLD = { sinInvento: 0.95, correcta: 0.85, noEnKbSinInvento: 0.9 } as const;

/** The type of question the promise is about: the data is not loaded and the bot must not invent it. */
export const PROMISE_TYPE = "no_en_kb";

export type EvalRow = {
  prompt_id: string;
  rep: number;
  prompt: string;
  tags: string[];
  model: string;
  status: string;
  grade: { correcta: number; sin_invento: number; tono: number };
  explanation?: { correcta?: string; sin_invento?: string; tono?: string };
  meta?: { expected?: { behavior?: string } };
  /** What detectAttention said of the answer (spec 016); absent in runs made before it was measured. */
  detector?: string | null;
};

const Ratio = z.number().min(0).max(1);

export const EvalSummarySchema = z.object({
  ranAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  model: z.string().min(1),
  cases: z.number().int().positive(),
  reps: z.number().int().positive(),
  answers: z.number().int().positive(),
  metrics: z.object({ correcta: Ratio, sinInvento: Ratio, tono: Ratio }),
  byType: z.array(
    z.object({
      type: z.string(),
      label: z.string(),
      cases: z.number().int(),
      answers: z.number().int(),
      correcta: Ratio,
      sinInvento: Ratio,
    }),
  ),
  // Spec 016: optional, so summaries published before the detector was measured still parse.
  detector: z
    .object({
      shouldDerive: z.number().int().nonnegative(),
      counted: z.number().int().nonnegative(),
      shouldNotDerive: z.number().int().nonnegative(),
      falseAlarms: z.number().int().nonnegative(),
    })
    .nullable()
    .optional(),
  examples: z.array(
    z.object({
      type: z.string(),
      label: z.string(),
      question: z.string(),
      answer: z.string(),
      correcta: z.boolean(),
      sinInvento: z.boolean(),
      reason: z.string(),
    }),
  ),
});

export type EvalSummary = z.infer<typeof EvalSummarySchema>;

/** The file the landing reads: `{ summary: null }` until a run is published. */
export const PublishedEvalSchema = z.object({ summary: EvalSummarySchema.nullable() });

const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
const typeOf = (row: EvalRow) => row.tags[0] ?? "otro";
const labelOf = (type: string) => EVAL_TYPE_LABELS[type as keyof typeof EVAL_TYPE_LABELS] ?? type;
const typeOrder = (type: string) => {
  const index = Object.keys(EVAL_TYPE_LABELS).indexOf(type);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

// Spec 016, criterion 2: when the model did what was expected, whether the panel should count a derivation.
const DERIVING_BEHAVIORS = new Set(["abstain", "partial"]);
const NON_DERIVING_BEHAVIORS = new Set(["answer", "redirect"]);
/** Answered rows the judge marked correct and that carry the detector's verdict. */
const judgedForDetector = (rows: readonly EvalRow[]) =>
  rows.filter((r) => r.status === "ok" && r.grade.correcta === 1 && r.detector !== undefined);
const shouldDerive = (r: EvalRow) => DERIVING_BEHAVIORS.has(r.meta?.expected?.behavior ?? "");

export type DetectorStats = NonNullable<EvalSummary["detector"]>;

/** How well the derivation detector did on the run, or null if the run did not measure it. */
export const summarizeDetector = (rows: readonly EvalRow[]): DetectorStats | null => {
  if (!rows.some((r) => r.detector !== undefined)) return null;
  const judged = judgedForDetector(rows);
  const deriving = judged.filter(shouldDerive);
  const nonDeriving = judged.filter((r) => NON_DERIVING_BEHAVIORS.has(r.meta?.expected?.behavior ?? ""));
  return {
    shouldDerive: deriving.length,
    counted: deriving.filter((r) => r.detector === "derivation").length,
    shouldNotDerive: nonDeriving.length,
    falseAlarms: nonDeriving.filter((r) => r.detector === "derivation").length,
  };
};

/** The answers that derived but the detector did not count (criterion 4): the owner got no notice. */
export const missedDerivations = (rows: readonly EvalRow[]) =>
  judgedForDetector(rows)
    .filter((r) => shouldDerive(r) && r.detector !== "derivation")
    .map(({ prompt_id, rep, prompt }) => ({ prompt_id, rep, prompt }));

/**
 * Summarizes a run. Truncated or failed rows are left out, as in summarize.mjs. `answers` holds the
 * bot's answer per `${prompt_id}#${rep}`; examples come from the first repetition, one per type,
 * preferring one the judge marked as incorrect so the pages show a failure when there is one.
 */
export const summarizeEval = ({
  rows,
  answers,
  ranAt,
}: {
  rows: EvalRow[];
  answers: Record<string, string>;
  ranAt: string;
}): EvalSummary => {
  const ok = rows.filter((r) => r.status === "ok");
  const models = new Map<string, number>();
  for (const r of ok) models.set(r.model, (models.get(r.model) ?? 0) + 1);
  const model = [...models.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

  const types = [...new Set(ok.map(typeOf))].sort((a, b) => typeOrder(a) - typeOrder(b));
  const firstRep = Math.min(...ok.map((r) => r.rep));

  const examples = types.flatMap((type) => {
    const candidates = ok
      .filter((r) => typeOf(r) === type && r.rep === firstRep && answers[`${r.prompt_id}#${r.rep}`])
      .sort((a, b) => a.prompt_id.localeCompare(b.prompt_id));
    const pick = candidates.find((r) => r.grade.correcta === 0) ?? candidates[0];
    if (!pick) return [];
    return [
      {
        type,
        label: labelOf(type),
        question: pick.prompt,
        answer: answers[`${pick.prompt_id}#${pick.rep}`],
        correcta: pick.grade.correcta === 1,
        sinInvento: pick.grade.sin_invento === 1,
        reason: pick.explanation?.correcta ?? "",
      },
    ];
  });

  return {
    ranAt,
    model,
    cases: new Set(ok.map((r) => r.prompt_id)).size,
    reps: new Set(ok.map((r) => r.rep)).size,
    answers: ok.length,
    metrics: {
      correcta: mean(ok.map((r) => r.grade.correcta)),
      sinInvento: mean(ok.map((r) => r.grade.sin_invento)),
      tono: mean(ok.map((r) => r.grade.tono)),
    },
    byType: types.map((type) => {
      const of = ok.filter((r) => typeOf(r) === type);
      return {
        type,
        label: labelOf(type),
        cases: new Set(of.map((r) => r.prompt_id)).size,
        answers: of.length,
        correcta: mean(of.map((r) => r.grade.correcta)),
        sinInvento: mean(of.map((r) => r.grade.sin_invento)),
      };
    }),
    detector: summarizeDetector(rows),
    examples,
  };
};

/** The results of the promise's own case, if the run had it. */
export const promiseCase = (summary: Pick<EvalSummary, "byType">) =>
  summary.byType.find((t) => t.type === PROMISE_TYPE) ?? null;

export const meetsPublishThreshold = (summary: Pick<EvalSummary, "metrics" | "byType">) =>
  summary.metrics.sinInvento >= PUBLISH_THRESHOLD.sinInvento &&
  summary.metrics.correcta >= PUBLISH_THRESHOLD.correcta &&
  (promiseCase(summary)?.sinInvento ?? 1) >= PUBLISH_THRESHOLD.noEnKbSinInvento;

/** The run the pages may show, or null: none published yet, malformed, or under the threshold. */
export const publishableEval = (data: unknown): EvalSummary | null => {
  const parsed = PublishedEvalSchema.safeParse(data);
  if (!parsed.success || !parsed.data.summary) return null;
  return meetsPublishThreshold(parsed.data.summary) ? parsed.data.summary : null;
};

const percent = new Intl.NumberFormat("es-AR", { style: "percent", maximumFractionDigits: 0 });
export const formatRatio = (ratio: number) => percent.format(ratio);

const longDate = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const formatEvalDate = (day: string) => longDate.format(new Date(`${day}T12:00:00Z`));

export type EvalSet = { cases: number; businesses: number; types: { type: string; label: string; cases: number }[] };

/** What the eval set covers (evals/rag-answers/cases.json), for /como-medimos. */
export const describeEvalSet = (
  cases: readonly { id: string; business: string; tags: readonly string[] }[],
): EvalSet => {
  const counts = new Map<string, number>();
  for (const c of cases) counts.set(c.tags[0] ?? "otro", (counts.get(c.tags[0] ?? "otro") ?? 0) + 1);
  return {
    cases: cases.length,
    businesses: new Set(cases.map((c) => c.business)).size,
    types: [...counts.entries()]
      .sort((a, b) => typeOrder(a[0]) - typeOrder(b[0]))
      .map(([type, count]) => ({ type, label: labelOf(type), cases: count })),
  };
};
