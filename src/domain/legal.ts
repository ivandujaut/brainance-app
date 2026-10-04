// Legal texts (spec 008). Bump TERMS_VERSION when the terms or the privacy policy change materially:
// owners who accepted an older version are asked to accept again.

export const TERMS_VERSION = "2026-10-07";

export const needsTermsAcceptance = (user: { termsVersion: string | null }) => user.termsVersion !== TERMS_VERSION;

export type LegalPlaceholders = { contact?: string; entity?: string };

/** Fills the placeholders of a legal text; anything missing stays visibly marked to complete. */
export const fillLegalText = (source: string, { contact, entity }: LegalPlaceholders) =>
  source
    .replaceAll("{{CONTACTO}}", contact || "[completar: email de contacto]")
    .replaceAll("{{RESPONSABLE}}", entity || "[completar: razón social, CUIT y domicilio]")
    .replaceAll("{{VERSION}}", TERMS_VERSION);
