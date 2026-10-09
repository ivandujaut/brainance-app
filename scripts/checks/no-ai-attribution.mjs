#!/usr/bin/env node
// Fails when a commit message or a PR description attributes the work to an AI tool (ADR 0010).
//
//   node scripts/checks/no-ai-attribution.mjs --file .git/COMMIT_EDITMSG   # commit-msg hook
//   node scripts/checks/no-ai-attribution.mjs --range origin/develop..HEAD  # every commit in a range
//   node scripts/checks/no-ai-attribution.mjs --env PR_BODY                 # text in an environment variable

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { commitMessageBody, findAiAttribution } from "./ai-attribution.mjs";

const [flag, value] = process.argv.slice(2);
if (!flag || !value) {
  console.error("Usage: no-ai-attribution.mjs --file <path> | --range <a..b> | --env <VAR>");
  process.exit(2);
}

/** @type {{ source: string, text: string }[]} */
const sources = [];
if (flag === "--file") {
  sources.push({ source: "el mensaje del commit", text: commitMessageBody(readFileSync(value, "utf8")) });
} else if (flag === "--range") {
  const log = execFileSync("git", ["log", "--format=%h%x00%B%x1e", value], { encoding: "utf8" });
  for (const entry of log.split("\x1e")) {
    const [hash, body] = entry.replace(/^\n/, "").split("\x00");
    if (hash) sources.push({ source: `el commit ${hash}`, text: body ?? "" });
  }
} else if (flag === "--env") {
  sources.push({ source: "la descripción del PR", text: process.env[value] ?? "" });
} else {
  console.error(`Unknown flag ${flag}`);
  process.exit(2);
}

const problems = sources.flatMap(({ source, text }) =>
  findAiAttribution(text).map(({ line, text: found }) => `  ${source}, línea ${line}: ${found}`),
);

if (problems.length > 0) {
  console.error("Atribución a una IA encontrada (ADR 0010, AGENTS.md → Autoría):");
  console.error(problems.join("\n"));
  console.error("Sacá esas líneas: en un commit, con `git commit --amend` o un rebase; en un PR, editando la descripción.");
  process.exit(1);
}
