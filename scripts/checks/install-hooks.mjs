#!/usr/bin/env node
// Points git at the versioned hooks in .githooks/ (ADR 0010). Runs from `npm install` (the `prepare` script).
// Outside a git checkout (for example, a deploy build) it does nothing.

import { execFileSync } from "node:child_process";

try {
  execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { stdio: "ignore" });
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "ignore" });
} catch {
  // Not a git checkout, or git is missing: nothing to install.
}
