#!/usr/bin/env node
// Prints a markdown summary of every variant under evals/rag-answers/results/.
//   npm run eval:summary -- [flow-dir]
// Scores are means over status-ok rows; ± is the 95% interval (normal approx.).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { missedDerivations, summarizeDetector } from "../../src/domain/eval-summary.ts";

const flow = process.argv[2] ?? "evals/rag-answers/results";
const state = JSON.parse(readFileSync(join(flow, "_state.json"), "utf8"));
const metrics = state.metrics.map((m) => m.id);
const variants = readdirSync(flow)
  .filter((d) => /^(baseline|v[1-9]\d*)$/.test(d) && existsSync(join(flow, d, "results.jsonl")))
  .sort((a, b) => (a === "baseline" ? -1 : b === "baseline" ? 1 : +a.slice(1) - +b.slice(1)));

const readJsonl = (p) =>
  existsSync(p) ? readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const pct = (xs) => {
  if (!xs.length) return "—";
  const p = mean(xs);
  const ci = 1.96 * Math.sqrt((p * (1 - p)) / xs.length);
  return `${(p * 100).toFixed(0)}% ±${(ci * 100).toFixed(0)}`;
};
const median = (xs) => {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const judgeCost = (r) => {
  const p = state.prices?.[r.judge_model];
  const u = r.judge_usage;
  return p && u ? ((u.input_tokens ?? 0) * p.in + (u.output_tokens ?? 0) * p.out) / 1e6 : 0;
};

const out = ["| variante | modelo | casos | " + metrics.join(" | ") + " | USD/1.000 resp. | latencia p50 | palabras p50 | errores |",
  "|---" + "|---".repeat(metrics.length + 6) + "|"];
const byCategory = {};
const detectorLines = [];
for (const v of variants) {
  const rows = readJsonl(join(flow, v, "results.jsonl"));
  const ok = rows.filter((r) => r.status === "ok");
  const errors = readJsonl(join(flow, v, "errors.jsonl")).length;
  const models = [...new Set(rows.map((r) => r.model))].join(", ");
  const costs = ok.map((r) => r.cost_usd).filter((c) => typeof c === "number");
  const cost = costs.length === ok.length && ok.length ? `$${(mean(costs) * 1000).toFixed(2)}` : "sin precio";
  out.push(`| ${v} | ${models} | ${ok.length}/${rows.length} | ${metrics.map((m) => pct(ok.map((r) => r.grade[m]))).join(" | ")} | ${cost} | ${median(ok.map((r) => r.latency_s)).toFixed(1)} s | ${median(ok.map((r) => r.words))} | ${errors} |`);
  for (const r of ok) ((byCategory[r.tags[0]] ??= {})[v] ??= []).push(r.grade[metrics[0]]);
  const evalSpend = rows.reduce((a, r) => a + (r.cost_usd ?? 0) + judgeCost(r), 0);
  // Spec 016: how the panel's derivation detector did on this variant.
  const detector = summarizeDetector(rows);
  if (detector) {
    const missed = missedDerivations(rows);
    const rate = (n, d) => (d ? `${((n / d) * 100).toFixed(0)}%` : "—");
    detectorLines.push(
      `- **${v}:** contó ${detector.counted} de ${detector.shouldDerive} derivaciones (${rate(detector.counted, detector.shouldDerive)}); ` +
        `falsas alarmas: ${detector.falseAlarms} de ${detector.shouldNotDerive} (${rate(detector.falseAlarms, detector.shouldNotDerive)}).`,
      ...missed.map((m) => `  - no contó \`${m.prompt_id}\` (rep ${m.rep}): ${m.prompt}`),
    );
  }
  out.push(`|  | gasto del eval (app + juez): $${evalSpend.toFixed(2)} |` + " |".repeat(metrics.length + 5));
}
out.push("", `### ${metrics[0]} por tipo de caso`, "", "| tipo | " + variants.join(" | ") + " |", "|---" + "|---".repeat(variants.length) + "|");
for (const [cat, vs] of Object.entries(byCategory)) out.push(`| ${cat} | ${variants.map((v) => pct(vs[v] ?? [])).join(" | ")} |`);
if (detectorLines.length) out.push("", "### Detector de derivaciones (spec 016)", "", ...detectorLines);
console.log(out.join("\n"));
