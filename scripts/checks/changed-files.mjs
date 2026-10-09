// Decides which local checks a set of changed files needs (ADR 0010). Used by the git hooks.

const LINTED = /\.(ts|tsx|js|mjs|cjs)$/;

/** Files ESLint should look at. @param {string[]} files */
export function lintTargets(files) {
  return files.filter((file) => LINTED.test(file));
}

/** Whether the change touches anything beyond Markdown (docs, AGENTS.md, CLAUDE.md…). @param {string[]} files */
export function needsCodeChecks(files) {
  return files.some((file) => !file.endsWith(".md"));
}
