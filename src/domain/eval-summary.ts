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

/** Spec 013, decision 4: the eval is published only from these scores up. */
export const PUBLISH_THRESHOLD = { sinInvento: 0.95, correcta: 0.85 } as const;

export type EvalRow = {
  prompt_id: string;
  rep: number;
  prompt: string;
  tags: string[];
  model: string;
  status: string;
  grade: { correcta: number; sin_invento: number; tono: number };
  explanation?: { correcta?: string; sin_invento?: string; tono?: string };
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
    examples,
  };
};

export const meetsPublishThreshold = (summary: Pick<EvalSummary, "metrics">) =>
  summary.metrics.sinInvento >= PUBLISH_THRESHOLD.sinInvento && summary.metrics.correcta >= PUBLISH_THRESHOLD.correcta;

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
