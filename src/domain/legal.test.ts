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
});
