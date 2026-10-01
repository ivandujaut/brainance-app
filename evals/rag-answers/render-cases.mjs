#!/usr/bin/env node
// Validates cases.json and renders cases.md for human review.
//   node evals/rag-answers/render-cases.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(readFileSync(join(here, "cases.json"), "utf8"));
const businesses = Object.fromEntries(
  readdirSync(join(here, "businesses"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(here, "businesses", f), "utf8")))
    .map((b) => [b.id, b]),
);

const BEHAVIORS = ["answer", "abstain", "partial", "redirect"];
const problems = [];
const ids = new Set();
const questions = new Set();
for (const c of cases) {
  if (ids.has(c.id)) problems.push(`duplicate id ${c.id}`);
  ids.add(c.id);
  const q = c.question.toLowerCase().replace(/\W+/g, " ").trim();
  if (questions.has(q)) problems.push(`duplicate question in ${c.id}`);
  questions.add(q);
  if (!businesses[c.business]) problems.push(`${c.id}: unknown business ${c.business}`);
  if (c.tags?.[1] !== c.business) problems.push(`${c.id}: tags[1] must be the business id`);
  if (!BEHAVIORS.includes(c.expected?.behavior)) problems.push(`${c.id}: bad behavior`);
  if (["answer", "partial"].includes(c.expected?.behavior) && !c.expected.must_include?.length)
    problems.push(`${c.id}: answer/partial cases need must_include`);
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

const count = (key) =>
  Object.entries(cases.reduce((acc, c) => ({ ...acc, [key(c)]: (acc[key(c)] ?? 0) + 1 }), {}))
    .map(([k, n]) => `${k}: ${n}`)
    .join(" · ");

const fence = (text) => {
  const longest = Math.max(2, ...[...text.matchAll(/`+/g)].map((m) => m[0].length));
  const f = "`".repeat(longest + 1);
  return `${f}\n${text}\n${f}`;
};

const lines = [
  "# Eval `rag-answers`: casos",
  "",
  "> Generado por `render-cases.mjs` a partir de `cases.json` y `businesses/`. No editar a mano.",
  "",
  `**${cases.length} casos.** Por tipo: ${count((c) => c.tags[0])}. Por negocio: ${count((c) => c.business)}. Por estilo: ${count((c) => c.tags[2])}.`,
  "",
  "Comportamientos esperados: `answer` = responde con los datos de la base; `abstain` = dice que no tiene el dato y deriva al contacto, sin inventar; `partial` = responde lo que sabe y deriva el resto; `redirect` = no obedece el pedido fuera de tema y vuelve al negocio.",
  "",
  "| id | tipo | negocio | esperado | pregunta |",
  "|---|---|---|---|---|",
  ...cases.map((c) => `| ${c.id} | ${c.tags[0]} | ${c.business} | ${c.expected.behavior} | ${c.question.replace(/\|/g, "\\|")} |`),
  "",
];

for (const b of Object.values(businesses)) {
  lines.push(`## ${b.name} (\`${b.id}\`)`, "", `${b.description} · trato: **${b.addressing}** · contacto: ${b.contact}`, "");
  lines.push("<details><summary>Base de conocimiento</summary>", "");
  for (const f of b.faqs) lines.push(`- **${f.question}** ${f.answer}`);
  lines.push("", "</details>", "");
  for (const c of cases.filter((x) => x.business === b.id)) {
    lines.push(`### ${c.id} · ${c.tags[0]} · ${c.tags[2]} → \`${c.expected.behavior}\``, "", fence(c.question), "");
    if (c.expected.must_include.length) lines.push(`- Debe incluir: ${c.expected.must_include.join("; ")}`);
    if (c.expected.must_not.length) lines.push(`- No debe: ${c.expected.must_not.join("; ")}`);
    lines.push("");
  }
}

writeFileSync(join(here, "cases.md"), lines.join("\n"));
console.log(`OK: ${cases.length} cases. ${count((c) => c.tags[0])}`);
