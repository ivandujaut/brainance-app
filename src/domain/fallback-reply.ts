import type { Addressing } from "./answer-prompt";

// Fixed replies that refer the visitor to the business without calling the model (spec 014): when
// the model fails, and when the site reached its daily cap (spec 007). Both follow the addressing.

type Business = { contact: string; addressing: Addressing };

const reachUs = ({ contact, addressing }: Business) =>
  addressing === "usted"
    ? `Puede comunicarse con el negocio por ${contact}.`
    : `Podés comunicarte con el negocio por ${contact}.`;

/** What the visitor reads when the model failed, timed out or answered nothing. */
export const fallbackReply = (business: Business) =>
  `No pude responder ${business.addressing === "usted" ? "su" : "tu"} consulta en este momento. ${reachUs(business)}`;

/** Fixed answer once the site reaches its daily cap. */
export const siteCapReply = (business: Business) =>
  `En este momento no puedo responder más consultas. ${reachUs(business)}`;

/** What to append to a (possibly partial) answer: the fallback, as a new paragraph after any text. */
export const fallbackSuffix = (partial: string, fallback: string) => (partial.trim() ? `\n\n${fallback}` : fallback);
