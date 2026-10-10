#!/usr/bin/env node
// CI entry point for scripts/checks/pr-direction.mjs. Needs the full history (checkout with fetch-depth: 0).
//
//   BASE_REF=develop HEAD_REF=feat/x HEAD_SHA=<sha> node scripts/checks/check-pr-direction.mjs

import { execFileSync } from "node:child_process";
import { LINE_BRANCH, prDirectionProblem } from "./pr-direction.mjs";

const { BASE_REF, HEAD_REF, HEAD_SHA } = process.env;
if (!BASE_REF || !HEAD_REF || !HEAD_SHA) {
  console.error("Usage: BASE_REF=<base> HEAD_REF=<head branch> HEAD_SHA=<sha> check-pr-direction.mjs");
  process.exit(2);
}

/** @param {string} range */
function commitsIn(range) {
  return execFileSync("git", ["rev-list", range], { encoding: "utf8" }).split("\n").filter(Boolean);
}

/** @param {string} ref */
function exists(ref) {
  try {
    execFileSync("git", ["rev-parse", "--verify", "--quiet", ref], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// If the line branch is gone (archived), there is nothing left to keep out.
const lineRef = `origin/${LINE_BRANCH}`;
const lineOnlyCommits = exists(lineRef) ? commitsIn(`origin/develop..${lineRef}`) : [];

const problem = prDirectionProblem({
  base: BASE_REF,
  head: HEAD_REF,
  lineOnlyCommits,
  prCommits: commitsIn(`origin/${BASE_REF}..${HEAD_SHA}`),
});

if (problem) {
  console.error(problem);
  process.exit(1);
}
