import { describe, expect, it } from "vitest";
import { lintTargets, needsCodeChecks } from "./changed-files.mjs";

describe("lintTargets", () => {
  it("keeps the files ESLint lints", () => {
    expect(lintTargets(["src/a.ts", "src/b.tsx", "scripts/c.mjs", "d.js", "e.cjs", "docs/x.md", "prisma/schema.prisma"])).toEqual([
      "src/a.ts",
      "src/b.tsx",
      "scripts/c.mjs",
      "d.js",
      "e.cjs",
    ]);
  });
});

describe("needsCodeChecks", () => {
  it("is false when only documentation or agent instructions changed", () => {
    expect(needsCodeChecks(["docs/adr/0010.md", "AGENTS.md", "src/actions/CLAUDE.md", "README.md"])).toBe(false);
    expect(needsCodeChecks([])).toBe(false);
  });

  it("is true when anything else changed", () => {
    expect(needsCodeChecks(["docs/x.md", "src/domain/plans.ts"])).toBe(true);
    expect(needsCodeChecks(["package.json"])).toBe(true);
    expect(needsCodeChecks(["prisma/schema.prisma"])).toBe(true);
  });
});
