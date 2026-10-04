// Fictional data for the product shots: a bakery in Rosario. Names, emails and phones are made up.

const at = (iso: string) => new Date(iso);

export const SITES = [{ id: "11111111-1111-4111-8111-111111111111", name: "laespiga.com.ar" }];

export const CONVERSATIONS = [
  {
    id: "r1",
    site: "laespiga.com.ar",
    visitor: "ana.romero@example.com",
    lastMessage: "Sí, los jueves horneamos sin TACC. ¿Para cuántas personas sería?",
    lastMessageAt: at("2026-10-03T14:42:00Z"),
    unread: 0,
    live: true,
    needsAttention: false,
    attentionReason: "human_request",
  },
  {
    id: "r2",
    site: "laespiga.com.ar",
    visitor: "Visitante",
    lastMessage: "Ese precio no lo tengo. Te paso con el local por WhatsApp.",
    lastMessageAt: at("2026-10-03T14:18:00Z"),
    unread: 2,
    live: false,
    needsAttention: true,
    attentionReason: "derivation",
  },
  {
    id: "r3",
    site: "laespiga.com.ar",
    visitor: "martin.p@example.com",
    lastMessage: "¡Gracias! Paso el sábado a buscarlo.",
    lastMessageAt: at("2026-10-03T12:05:00Z"),
    unread: 0,
    live: false,
    needsAttention: false,
    attentionReason: null,
  },
  {
    id: "r4",
    site: "laespiga.com.ar",
    visitor: "Visitante",
    lastMessage: "Abrimos de lunes a sábado de 7 a 20 y los domingos de 8 a 13.",
    lastMessageAt: at("2026-10-03T10:31:00Z"),
    unread: 0,
    live: false,
    needsAttention: false,
    attentionReason: null,
  },
  {
    id: "r5",
    site: "laespiga.com.ar",
    visitor: "lucia.f@example.com",
    lastMessage: "Sí, hacemos envíos dentro de Rosario por $2.500.",
    lastMessageAt: at("2026-10-02T21:47:00Z"),
    unread: 0,
    live: false,
    needsAttention: false,
    attentionReason: null,
  },
  {
    id: "r6",
    site: "laespiga.com.ar",
    visitor: "Visitante",
    lastMessage: "La torta de cumpleaños se encarga con 48 horas de anticipación.",
    lastMessageAt: at("2026-10-02T18:12:00Z"),
    unread: 0,
    live: false,
    needsAttention: false,
    attentionReason: null,
  },
];

export const CONVERSATION = {
  id: "r1",
  site: "laespiga.com.ar",
  live: true,
  needsAttention: false,
  attentionReason: "human_request",
  lead: {
    email: "ana.romero@example.com",
    responses: [
      { question: "¿Para qué fecha lo necesitás?", answered: "Sábado 10/10" },
      { question: "¿Cuántas personas?", answered: "Unas 15" },
    ],
  },
  messages: [
    { id: "m1", role: "user", content: "Hola, ¿hacen tortas sin TACC?", createdAt: at("2026-10-03T14:31:00Z") },
    {
      id: "m2",
      role: "assistant",
      content: "¡Hola! Sí: los jueves horneamos pan, budines y tortas sin TACC en un horno aparte. Se encargan hasta el miércoles al mediodía.",
      createdAt: at("2026-10-03T14:31:10Z"),
    },
    { id: "m3", role: "user", content: "Es para un cumpleaños el sábado. ¿Puedo hablar con alguien?", createdAt: at("2026-10-03T14:36:00Z") },
    { id: "m4", role: "system", content: "Ahora te atiende una persona de La Espiga.", createdAt: at("2026-10-03T14:38:00Z") },
    {
      id: "m5",
      role: "owner",
      content: "¡Hola Ana! Soy Marta. Sí, los jueves horneamos sin TACC y te la guardamos para el sábado. ¿Para cuántas personas sería?",
      createdAt: at("2026-10-03T14:42:00Z"),
    },
  ],
};
