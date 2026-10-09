import { describe, expect, it } from "vitest";
import { checkBashCommand } from "./bash-guard.mjs";

describe("checkBashCommand", () => {
  it("lets ordinary commands through", () => {
    expect(checkBashCommand("npm test")).toBeNull();
    expect(checkBashCommand('git commit -q -m "feat: x"')).toBeNull();
    expect(checkBashCommand("git push -u origin feat/x")).toBeNull();
    expect(checkBashCommand("git push -n origin feat/x")).toBeNull(); // -n is a dry run for push
    expect(checkBashCommand("git config core.hooksPath .githooks")).toBeNull();
  });

  it("blocks skipping the git hooks", () => {
    expect(checkBashCommand('git commit --no-verify -m "x"')).toMatch(/hooks/);
    expect(checkBashCommand('git commit -n -m "x"')).toMatch(/hooks/);
    expect(checkBashCommand("git push --no-verify origin x")).toMatch(/hooks/);
    expect(checkBashCommand('git -c core.hooksPath=/dev/null commit -m "x"')).toMatch(/hooks/);
    expect(checkBashCommand("git config core.hooksPath /tmp/none")).toMatch(/hooks/);
  });

  it("blocks a commit message that attributes the work to an AI tool", () => {
    const heredoc = 'git commit -F - <<EOF\nfeat: x\n\nCo-Authored-By: Claude <noreply@anthropic.com>\nEOF';
    expect(checkBashCommand(heredoc)).toMatch(/atribución/);
    expect(checkBashCommand('git commit -m "feat: x" -m "Co-Authored-By: Claude <noreply@anthropic.com>"')).toMatch(
      /atribución/,
    );
    expect(checkBashCommand('git commit -m "x" -m "Claude-Session: https://claude.ai/code/session_01"')).toMatch(
      /atribución/,
    );
  });

  it("does not inspect the text of commands that are not commits", () => {
    expect(checkBashCommand('grep -rn "Co-Authored-By: Claude" docs')).toBeNull();
  });
});
