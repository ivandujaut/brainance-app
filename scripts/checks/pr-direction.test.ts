import { describe, expect, it } from "vitest";
import { prDirectionProblem } from "./pr-direction.mjs";

const lineOnlyCommits = ["aaa111", "bbb222"];

describe("prDirectionProblem", () => {
  it("blocks merging the whatsapp-os branch into develop or main", () => {
    expect(prDirectionProblem({ base: "develop", head: "whatsapp-os", lineOnlyCommits, prCommits: [] })).toMatch(
      /ADR 0100/,
    );
    expect(prDirectionProblem({ base: "main", head: "whatsapp-os", lineOnlyCommits, prCommits: [] })).toMatch(
      /ADR 0100/,
    );
  });

  it("blocks a branch that carries commits only whatsapp-os has", () => {
    const problem = prDirectionProblem({
      base: "develop",
      head: "feat/100-canal-del-dueno",
      lineOnlyCommits,
      prCommits: ["ccc333", "bbb222"],
    });
    expect(problem).toMatch(/1 commit/);
    expect(problem).toMatch(/whatsapp-os/);
  });

  it("accepts a branch made from develop", () => {
    expect(
      prDirectionProblem({ base: "develop", head: "fix/x", lineOnlyCommits, prCommits: ["ccc333", "ddd444"] }),
    ).toBeNull();
  });

  it("accepts any PR into whatsapp-os, including bringing develop over", () => {
    expect(prDirectionProblem({ base: "whatsapp-os", head: "develop", lineOnlyCommits, prCommits: [] })).toBeNull();
    expect(
      prDirectionProblem({ base: "whatsapp-os", head: "docs/x", lineOnlyCommits, prCommits: ["aaa111"] }),
    ).toBeNull();
  });

  it("accepts everything when whatsapp-os has nothing of its own", () => {
    expect(prDirectionProblem({ base: "develop", head: "fix/x", lineOnlyCommits: [], prCommits: ["ccc333"] })).toBeNull();
  });
});
