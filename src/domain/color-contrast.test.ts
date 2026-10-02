import { describe, expect, it } from "vitest";
import {
  AA_CONTRAST,
  contrastRatio,
  DARK_TEXT,
  hslToHex,
  isHexColor,
  LIGHT_TEXT,
  readableTextColor,
} from "./color-contrast";

describe("isHexColor", () => {
  it.each(["#FFA947", "#ffa947", "#000000"])("accepts %s", (value) => {
    expect(isHexColor(value)).toBe(true);
  });

  it.each(["FFA947", "#FFF", "#FFA9477", "#GGGGGG", "red", "", "rgb(0,0,0)"])("rejects %s", (value) => {
    expect(isHexColor(value)).toBe(false);
  });
});

describe("contrastRatio", () => {
  it("is 21:1 for black on white and 1:1 for equal colors", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#FFA947", "#FFA947")).toBeCloseTo(1, 5);
  });

  it("does not depend on the order of the colors", () => {
    expect(contrastRatio("#FFFFFF", "#4E4E4E")).toBeCloseTo(contrastRatio("#4E4E4E", "#FFFFFF"), 10);
  });

  it("matches the WCAG reference values", () => {
    // White on the brand orange fails AA: this is why the widget's text color is computed.
    expect(contrastRatio("#FFFFFF", "#FFA947")).toBeCloseTo(1.91, 2);
    expect(contrastRatio("#FFFFFF", "#767676")).toBeCloseTo(4.54, 2);
  });
});

describe("readableTextColor", () => {
  it("uses dark text on light backgrounds", () => {
    expect(readableTextColor("#FFA947")).toBe(DARK_TEXT);
    expect(readableTextColor("#FFFFFF")).toBe(DARK_TEXT);
  });

  it("uses white text on dark backgrounds", () => {
    expect(readableTextColor("#123456")).toBe(LIGHT_TEXT);
    expect(readableTextColor("#000000")).toBe(LIGHT_TEXT);
  });

  it.each(["#FFA947", "#123456", "#E11D48", "#10B981", "#7C3AED", "#FACC15", "#0EA5E9"])(
    "meets AA on %s",
    (background) => {
      expect(contrastRatio(background, readableTextColor(background))).toBeGreaterThanOrEqual(AA_CONTRAST);
    },
  );

  it("picks the higher contrast when neither option reaches AA", () => {
    // Mid grays sit between both options; whatever is returned must be the better one.
    for (const background of ["#777777", "#808080", "#6B7280"]) {
      const chosen = readableTextColor(background);
      const other = chosen === LIGHT_TEXT ? DARK_TEXT : LIGHT_TEXT;
      expect(contrastRatio(background, chosen)).toBeGreaterThanOrEqual(contrastRatio(background, other));
    }
  });
});

describe("hslToHex", () => {
  it("converts the CSS-variable notation used by the design tokens", () => {
    expect(hslToHex("0 0% 100%")).toBe("#FFFFFF");
    expect(hslToHex("0 0% 0%")).toBe("#000000");
    expect(hslToHex("32 100% 64%")).toBe("#FFA947");
    expect(hslToHex("222.2 47.4% 11.2%")).toBe("#0F172A");
  });

  it("rejects anything else", () => {
    expect(() => hslToHex("rojo")).toThrow();
  });
});
