// "Needs attention" rule for the inbox (spec 006). Deliberately simple and explainable; if the beta
// shows it is not enough, a classifier replaces it (ADR 0001).

export type AttentionReason = "derivation" | "human_request" | "site_cap";

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const HUMAN_REQUESTS = [
  /\b(hablar|chatear|comunicar(me)?|contactar(me)?) con (alguien|una persona|un humano|una? asesora?|una? vendedora?|un agente|una? operadora?|atencion al cliente|soporte|el dueno|la duena)\b/,
  /\b(pasame|pasarme|comunicame|derivame|derivarme|conectame|conectarme) con\b/,
  /\batiend[ae]n? (un|una) (humano|persona)\b/,
  /\balguien que me (pueda )?atend/,
  /\b(persona real|ser humano)\b/,
];

/** Whether the visitor is asking to talk to a person instead of the bot. */
export const asksForHuman = (text: string) => {
  const normalized = normalize(text);
  return HUMAN_REQUESTS.some((pattern) => pattern.test(normalized));
};

/** Why this exchange needs the owner, or null. A reply quoting the business contact is a derivation. */
export const detectAttention = ({
  visitorText,
  reply,
  contact,
}: {
  visitorText: string;
  reply: string;
  contact: string | null;
}): AttentionReason | null => {
  if (asksForHuman(visitorText)) return "human_request";
  const needle = contact ? normalize(contact) : "";
  if (needle && normalize(reply).includes(needle)) return "derivation";
  return null;
};
