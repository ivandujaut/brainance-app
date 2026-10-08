#!/usr/bin/env node
// Writes the eval summary the landing and /como-medimos publish (spec 013):
//   npm run eval:publish -- [--flow evals/rag-answers/results] [--variant baseline] [--date YYYY-MM-DD]
// Reads <flow>/<variant>/results.jsonl and the bot's answers from <flow>/<variant>/traces/ (which
// are not committed, so this runs right after the eval, in the same job). The numbers come from
// summarizeEval in src/domain/eval-summary.ts; this script only reads and writes files.
import { existsSync, lstatSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { meetsPublishThreshold, summarizeEval } from "../../src/domain/eval-summary.ts";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const flow = arg("flow", "evals/rag-answers/results");
const variant = arg("variant", "baseline");
const ranAt = arg("date", new Date().toISOString().slice(0, 10));
const out = "src/content/eval/rag-answers.json";

if (!/^(baseline|v[1-9]\d*)$/.test(variant))
  throw new Error(`--variant must be 'baseline' or 'v<N>', got '${variant}'`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(ranAt)) throw new Error(`--date must be YYYY-MM-DD, got '${ranAt}'`);

const dir = join(flow, variant);
const resultsPath = join(dir, "results.jsonl");
if (!existsSync(resultsPath)) throw new Error(`No results at ${resultsPath}: run the eval first.`);

// The flow dir holds model output: refuse symlinks instead of following them.
const readPlain = (path) => (existsSync(path) && lstatSync(path).isFile() ? readFileSync(path, "utf8") : null);

const rows = readPlain(resultsPath)
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));
const answers = {};
for (const row of rows) {
  const trace = readPlain(join(dir, "traces", `${row.prompt_id}_rep${row.rep}.json`));
  if (!trace) continue;
  const last = JSON.parse(trace)
    .filter((m) => m.role === "assistant")
    .at(-1);
  if (typeof last?.content === "string" && last.content.trim()) answers[`${row.prompt_id}#${row.rep}`] = last.content;
}

const summary = summarizeEval({ rows, answers, ranAt });
writeFileSync(out, `${JSON.stringify({ summary }, null, 2)}\n`);

const pct = (x) => `${(x * 100).toFixed(0)}%`;
console.log(
  `${out}: ${summary.model}, ${summary.cases} consultas × ${summary.reps}, correcta ${pct(summary.metrics.correcta)}, ` +
    `sin inventar ${pct(summary.metrics.sinInvento)}, ${summary.examples.length} ejemplos.`,
);
console.log(
  meetsPublishThreshold(summary)
    ? "Llega al umbral: la portada y /como-medimos van a mostrar los números."
    : "No llega al umbral (spec 013, decisión 4): las páginas salen sin números hasta mejorar el prompt.",
);
