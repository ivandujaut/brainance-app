// Detects lines that attribute a commit or a PR to an AI tool (ADR 0010).
// Plain ESM with no dependencies, so git hooks and CI can run it with `node` alone.

const AI_NAMES = "claude|anthropic|openai|chatgpt|codex|copilot|gemini|cursor|devin|windsurf|codeium|aider";

const RULES = [
  // A co-author trailer naming an AI tool or its noreply address.
  new RegExp(`^\\s*co-authored-by:.*\\b(${AI_NAMES})\\b`, "i"),
  // Session trailers and session links.
  /^\s*claude-session:/i,
  /claude\.ai\/code\/session_/i,
  // "Generated with/by <AI tool>" footers, with or without a leading emoji or markdown (`_`, `*`).
  new RegExp(`^[^a-z0-9]*generated (with|by)\\b.*\\b(${AI_NAMES}|ai)\\b`, "i"),
];

/**
 * Returns the lines of `text` that attribute the work to an AI tool, with 1-based line numbers.
 * @param {string | undefined | null} text
 * @returns {{ line: number, text: string }[]}
 */
export function findAiAttribution(text) {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line, index) => ({ line: index + 1, text: line.trim() }))
    .filter(({ text: line }) => RULES.some((rule) => rule.test(line)));
}

const SCISSORS = "# ------------------------ >8 ------------------------";

/**
 * The part of a commit message file that git keeps: no comment lines, nothing below the scissors line.
 * @param {string} raw
 */
export function commitMessageBody(raw) {
  const lines = raw.split(/\r?\n/);
  const cut = lines.indexOf(SCISSORS);
  return (cut === -1 ? lines : lines.slice(0, cut)).filter((line) => !line.startsWith("#")).join("\n");
}
