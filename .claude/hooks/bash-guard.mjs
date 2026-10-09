#!/usr/bin/env node
// Claude Code PreToolUse hook for Bash (ADR 0010): blocks commands from scripts/checks/bash-guard.mjs.
// Exit code 2 blocks the call and shows the reason to Claude.

import { readFileSync } from "node:fs";
import { checkBashCommand } from "../../scripts/checks/bash-guard.mjs";

let command = "";
try {
  command = JSON.parse(readFileSync(0, "utf8"))?.tool_input?.command ?? "";
} catch {
  process.exit(0); // unreadable input: let the permission system decide
}

const reason = checkBashCommand(command);
if (reason) {
  console.error(reason);
  process.exit(2);
}
