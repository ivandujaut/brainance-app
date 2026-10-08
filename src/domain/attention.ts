// "Needs attention" rule for the inbox (spec 006). Deliberately simple and explainable; if the beta
// shows it is not enough, a classifier replaces it (ADR 0001).

export type AttentionReason = "derivation" | "human_request" | "site_cap" | "model_error";

/** Reasons that usually hit every conversation of a site at once: the owner hears about them once a day. */
export const DAILY_REASONS: readonly AttentionReason[] = ["site_cap", "model_error"];

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

// The model rewords the contact ("WhatsApp +54 9 11 5555-0000 (prueba)" comes back without the note),
// so a derivation is a reply that repeats one of its details: a phone, an email, a link or a handle.
const MIN_PHONE_DIGITS = 8;
const PHONE = /\+?\(?\d[\d\s().-]*\d/g;
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g;
const HANDLE = /(?<![\w.])@[a-z0-9_.]*[a-z0-9_]/g;
const LINK = /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?:\/[^\s,;)]*)?/g;

const phones = (text: string) =>
  (text.match(PHONE) ?? [])
    .map((match) => match.replace(/\D/g, ""))
    .filter((digits) => digits.length >= MIN_PHONE_DIGITS);

const links = (text: string) =>
  (text.match(LINK) ?? []).map((match) =>
    match
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/[.,;:!?]+$/, ""),
  );

/** The contact's details, normalized: phone digits, and emails, handles and links as written. */
const contactDetails = (contact: string) => ({
  phones: phones(contact),
  words: [...(contact.match(EMAIL) ?? []), ...(contact.match(HANDLE) ?? []), ...links(contact)],
});

// A phone may come back with or without the country and area codes: one number ends with the other.
const samePhone = (a: string, b: string) => a.endsWith(b) || b.endsWith(a);

const repeatsContact = (reply: string, contact: string) => {
  if (reply.includes(contact)) return true;
  const details = contactDetails(contact);
  if (!details.phones.length && !details.words.length) return false;
  const replyPhones = phones(reply);
  return (
    details.phones.some((phone) => replyPhones.some((other) => samePhone(phone, other))) ||
    details.words.some((word) => reply.includes(word))
  );
};

// The prompt asks the bot to say it does not have the information before offering the contact
// (src/domain/answer-prompt.ts). An answer that just adds the contact "for more details" is not a
// derivation (QA of spec 011). Matched on normalized text: no accents, lower case.
const LACKS_DATA = [
  /\bno (tengo|tenemos|cuento con|contamos con|dispongo de|disponemos de|manejo|manejamos)\b[^.?!]{0,40}\b(informacion|info|dato|datos|detalle|detalles)\b/,
  /\b(informacion|dato|datos|detalle|detalles)\b[^.?!]{0,30}\bno (la|lo|las|los) (tengo|tenemos)\b/,
  /\bno (te |le |les |se )?(puedo|podemos|sabria|sabriamos)\b[^.?!]{0,20}\b(confirmar|decir|responder|asegurar|precisar|informar)/,
  /\bno (figura|figuran|aparece|aparecen)\b/,
];

const saysItLacksData = (reply: string) => LACKS_DATA.some((pattern) => pattern.test(reply));

/**
 * Why this exchange needs the owner, or null. A derivation is a reply that says it lacks the data
 * and repeats the business contact.
 */
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
  const text = normalize(reply);
  if (needle && saysItLacksData(text) && repeatsContact(text, needle)) return "derivation";
  return null;
};
