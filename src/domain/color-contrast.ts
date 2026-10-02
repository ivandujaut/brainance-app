// Color contrast per WCAG 2.x. Used to pick readable text over the owner's widget color and to
// check the dashboard's design tokens (ADR 0005).

/** Minimum contrast for normal text under WCAG AA. */
export const AA_CONTRAST = 4.5;

export const LIGHT_TEXT = "#FFFFFF";
/** Same near-black as the dashboard's `--primary-foreground`. */
export const DARK_TEXT = "#0F172A";

const HEX = /^#[0-9a-f]{6}$/i;

export const isHexColor = (value: string) => HEX.test(value);

const channels = (hex: string) => {
  if (!isHexColor(hex)) throw new Error(`Invalid hex color: ${hex}`);
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
};

const relativeLuminance = (hex: string) => {
  const [r, g, b] = channels(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrastRatio = (a: string, b: string) => {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

/** White or near-black, whichever reads better on `background`. */
export const readableTextColor = (background: string) =>
  contrastRatio(background, LIGHT_TEXT) >= contrastRatio(background, DARK_TEXT) ? LIGHT_TEXT : DARK_TEXT;

const HSL = /^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/;

/** Converts the shadcn token notation (`"32 100% 64%"`) to `#RRGGBB`. */
export const hslToHex = (value: string) => {
  const match = HSL.exec(value.trim());
  if (!match) throw new Error(`Invalid HSL triplet: ${value}`);
  const [h, s, l] = [Number(match[1]), Number(match[2]) / 100, Number(match[3]) / 100];
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const sector = Math.floor(h / 60) % 6;
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][sector];
  const hex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
};
