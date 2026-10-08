import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { fillLegalText, needsTermsAcceptance, TERMS_VERSION } from "./legal";

describe("legal", () => {
  it("asks owners to accept when they never did or accepted an older version", () => {
    expect(needsTermsAcceptance({ termsVersion: null })).toBe(true);
    expect(needsTermsAcceptance({ termsVersion: "2020-01-01" })).toBe(true);
    expect(needsTermsAcceptance({ termsVersion: TERMS_VERSION })).toBe(false);
  });

  it("fills the placeholders and marks what is missing", () => {
    const text = "Escribinos a {{CONTACTO}}. Responsable: {{RESPONSABLE}}. Versión {{VERSION}}.";
    expect(fillLegalText(text, { contact: "privacidad@example.com", entity: "Ejemplo SRL" })).toBe(
      `Escribinos a privacidad@example.com. Responsable: Ejemplo SRL. Versión ${TERMS_VERSION}.`,
    );
    expect(fillLegalText(text, {})).toContain("[completar: email de contacto]");
    expect(fillLegalText(text, {})).toContain("[completar: razón social, CUIT y domicilio]");
  });

  // Spec 013, criterion 10: the terms promise the same as the landing about the end of the beta.
  it("says what happens when the beta ends, in a new version", () => {
    const terms = readFileSync("src/content/legal/terminos.md", "utf8");
    for (const promise of ["30 días", "precio", "no se cobra", "CSV"]) expect(terms).toContain(promise);
    expect(TERMS_VERSION > "2026-10-07").toBe(true);
  });
});
