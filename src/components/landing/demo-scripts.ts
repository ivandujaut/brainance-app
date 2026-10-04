// Scripted conversations for the landing's demo (spec 009). Fictional businesses: names, phones and
// emails are made up (555 numbers, example.com).

export type DemoTurn = { role: "user" | "assistant"; text: string };

export type DemoScenario = {
  id: string;
  label: string;
  name: string;
  domain: string;
  color: string;
  welcome: string;
  turns: DemoTurn[];
  /** What the owner gets at the end: a lead or a conversation flagged for attention. */
  outcome: { kind: "lead" | "attention"; title: string; detail: string };
};

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "panaderia",
    label: "Panadería",
    name: "La Espiga",
    domain: "laespiga.com.ar",
    color: "#B45309",
    welcome: "¡Hola! Soy el asistente de La Espiga. ¿En qué te ayudo?",
    turns: [
      { role: "user", text: "¿Tienen algo sin TACC?" },
      {
        role: "assistant",
        text: "Sí: los jueves horneamos pan y budines sin TACC, en un horno aparte. Se encargan hasta el miércoles al mediodía.",
      },
      { role: "user", text: "Buenísimo. ¿El domingo abren?" },
      { role: "assistant", text: "Sí, los domingos de 8 a 13. Si querés, dejame tu email y te avisamos cuando esté tu encargo." },
    ],
    outcome: { kind: "lead", title: "Nuevo contacto", detail: "ana@example.com · encargo sin TACC" },
  },
  {
    id: "taller",
    label: "Taller",
    name: "Taller Don Rubén",
    domain: "tallerdonruben.com.ar",
    color: "#1E3A5F",
    welcome: "¡Buenas! ¿Qué le pasa al auto?",
    turns: [
      { role: "user", text: "Me hace ruido el freno de adelante. ¿Lo pueden ver hoy?" },
      {
        role: "assistant",
        text: "Hoy la agenda está completa, pero mañana a las 9 hay lugar. El diagnóstico de frenos no tiene costo si hacés el arreglo acá.",
      },
      { role: "user", text: "¿Cuánto sale cambiar las pastillas?" },
      {
        role: "assistant",
        text: "Ese precio no lo tengo: depende del modelo. Te paso con Rubén por WhatsApp al +54 9 351 555-0101 y te pasa el presupuesto.",
      },
    ],
    outcome: { kind: "attention", title: "Necesita atención", detail: "Pidió un presupuesto que el bot no tenía" },
  },
  {
    id: "inmobiliaria",
    label: "Inmobiliaria",
    name: "Patio Propiedades",
    domain: "patiopropiedades.com.ar",
    color: "#3F6212",
    welcome: "Hola, ¿buscás alquilar o comprar?",
    turns: [
      { role: "user", text: "¿El 2 ambientes de Palermo acepta mascotas?" },
      { role: "assistant", text: "Sí, acepta mascotas chicas. Pide garantía propietaria o seguro de caución." },
      { role: "user", text: "Me gustaría verlo el sábado." },
      { role: "assistant", text: "Los sábados mostramos de 10 a 13. Dejame tu email y te confirmamos el horario." },
    ],
    outcome: { kind: "lead", title: "Nuevo contacto", detail: "martin@example.com · visita el sábado" },
  },
];
