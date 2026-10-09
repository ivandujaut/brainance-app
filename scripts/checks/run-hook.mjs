#!/usr/bin/env node
// Runs the checks for a git hook (ADR 0010). The hooks in .githooks/ are thin wrappers around this file,
// so the logic is the same on every OS. Skip once with `git commit --no-verify` / `git push --no-verify`;
// CI runs the same checks and can't be skipped.

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { lintTargets, needsCodeChecks } from "./changed-files.mjs";

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).split("\n").filter(Boolean);

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

const ZERO = /^0+$/;

/** Where a new branch forked from what the remote already has. */
const remoteBase = (sha) => {
  for (const ref of ["@{upstream}", "origin/develop", "origin/main"]) {
    try {
      return git("merge-base", sha, ref).at(0);
    } catch {
      // try the next one
    }
  }
  return undefined;
};

/** Files changed by the commits a push sends, read from the hook's stdin. */
const pushedFiles = () => {
  const files = new Set();
  for (const line of readFileSync(0, "utf8").split("\n").filter(Boolean)) {
    const [, localSha, , remoteSha] = line.split(" ");
    if (ZERO.test(localSha)) continue; // deleting a remote branch
    // A new branch has no remote sha: compare with what the remote already has.
    const base = ZERO.test(remoteSha) ? remoteBase(localSha) : remoteSha;
    if (!base) {
      files.add("(unknown)"); // nothing to compare with: run the checks to be safe
      continue;
    }
    for (const file of git("diff", "--name-only", `${base}..${localSha}`)) files.add(file);
  }
  return [...files];
};

const hook = process.argv[2];

if (hook === "pre-commit") {
  const staged = git("diff", "--cached", "--name-only", "--diff-filter=ACMR");
  const lint = lintTargets(staged);
  if (lint.length > 0) run("npx", ["--no-install", "eslint", "--no-warn-ignored", ...lint]);
  if (needsCodeChecks(staged)) run("npm", ["run", "-s", "typecheck"]);
} else if (hook === "pre-push") {
  let files;
  try {
    files = pushedFiles();
  } catch {
    files = ["(unknown)"]; // no upstream to compare with: run the tests to be safe
  }
  if (needsCodeChecks(files)) run("npm", ["test", "--silent"]);
} else {
  console.error(`Unknown hook ${hook}`);
  process.exit(2);
}
