import type { CSSProperties } from "react";

// Hairline figures (MIT, @lucasmarkes/hairline) themed with the page's tokens (spec 009).
export const hairlineTheme = {
  "--hairline-plate": "hsl(var(--card))",
  "--hairline-hi": "hsl(var(--foreground))",
  "--hairline-edge": "hsl(var(--muted-foreground))",
  "--hairline-mid": "hsl(var(--muted-foreground) / 0.7)",
  "--hairline-lo": "hsl(var(--border))",
  "--hairline-stroke": "0.9",
} as CSSProperties;
