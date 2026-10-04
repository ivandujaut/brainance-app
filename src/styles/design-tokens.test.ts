import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AA_CONTRAST, contrastRatio, hslToHex } from "@/domain/color-contrast";

// ADR 0005: the dashboard's colors come from the tokens in globals.css, and every background/text
// pair must meet WCAG AA in light and dark mode.
const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

// The paper palette only overrides surfaces and text; primary, ring and destructive come from the base.
const BASE: Record<string, string> = { ".theme-paper": ":root", ".dark .theme-paper": ".dark" };

const tokensIn = (selector: string): Record<string, string> => {
  const block = new RegExp(`(?:^|[\\s}])${selector.replaceAll(".", "\\.")}\\s*\\{([^}]*)\\}`).exec(css)?.[1];
  if (!block) throw new Error(`No ${selector} block in globals.css`);
  const own = Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
  return BASE[selector] ? { ...tokensIn(BASE[selector]), ...own } : own;
};

const PAIRS = [
  ["background", "foreground"],
  ["card", "card-foreground"],
  ["popover", "popover-foreground"],
  ["primary", "primary-foreground"],
  ["secondary", "secondary-foreground"],
  ["muted", "muted-foreground"],
  ["accent", "accent-foreground"],
  ["destructive", "destructive-foreground"],
  // Secondary text also sits on the page background.
  ["background", "muted-foreground"],
] as const;

describe.each([":root", ".dark", ".theme-paper", ".dark .theme-paper"])("design tokens in %s", (selector) => {
  const tokens = tokensIn(selector);

  it.each(PAIRS)("%s / %s meets AA", (background, text) => {
    const ratio = contrastRatio(hslToHex(tokens[background]), hslToHex(tokens[text]));
    expect(ratio, `${background} / ${text}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_CONTRAST);
  });

  it("uses the brand orange as primary and focus ring", () => {
    expect(hslToHex(tokens.primary)).toBe("#FFA947");
    expect(tokens.ring).toBe(tokens.primary);
  });
});
