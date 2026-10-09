// Shell commands an AI agent must not run (ADR 0010). Agent adapters (for example, the Claude Code
// PreToolUse hook in .claude/hooks/) call this before running a command; git hooks and CI stay the guarantee.

import { findAiAttribution } from "./ai-attribution.mjs";

const GIT = String.raw`\bgit\b(?:\s+-c\s+\S+)*\s+`;
const GIT_COMMIT = new RegExp(`${GIT}commit\\b`);
const GIT_PUSH = new RegExp(`${GIT}push\\b`);

const SKIP_HOOKS =
  "Los hooks de git no se saltean desde un agente (ADR 0010). Si un hook falla, arreglá la causa; si es un falso positivo, contáselo al dueño.";
const ATTRIBUTION =
  "El mensaje del commit tiene atribución a una IA (Co-Authored-By de un modelo, Claude-Session o un link de sesión). Sacala: AGENTS.md → Autoría.";

/**
 * Returns why `command` must not run, or null when it can.
 * @param {string} command
 * @returns {string | null}
 */
export function checkBashCommand(command) {
  const hooksPath = command.match(/core\.hooksPath[=\s]+(\S+)/);
  if (hooksPath && hooksPath[1].replace(/["']/g, "") !== ".githooks") return SKIP_HOOKS;

  const isCommit = GIT_COMMIT.test(command);
  if ((isCommit || GIT_PUSH.test(command)) && /(^|\s)--no-verify\b/.test(command)) return SKIP_HOOKS;
  if (isCommit && /\s-n(\s|$)/.test(command)) return SKIP_HOOKS; // `-n` is --no-verify for commit, a dry run for push

  if (isCommit) {
    // Put each quoted -m argument and each heredoc line on its own line, as git would store them.
    const message = command.replace(/\\n/g, "\n").split(/["']/).join("\n");
    if (findAiAttribution(message).length > 0) return ATTRIBUTION;
  }
  return null;
}
