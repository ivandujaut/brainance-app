import { describe, expect, it } from "vitest";
import { buildAnswerSystemPrompt, type BusinessKnowledge } from "./answer-prompt";

const business: BusinessKnowledge = {
  name: "La Percha Indumentaria",
  description: "Tienda online de ropa en Rosario",
  addressing: "vos",
  contact: "WhatsApp +54 9 341 555-0101, de lunes a viernes de 9 a 18",
  faqs: [
    { question: "¿Hacen envíos?", answer: "Sí, a todo el país con Correo Argentino." },
    { question: "¿Aceptan cuotas?", answer: "3 cuotas sin interés con tarjetas de crédito bancarias." },
  ],
};

describe("buildAnswerSystemPrompt", () => {
  it("includes every FAQ answer from the knowledge base", () => {
    const prompt = buildAnswerSystemPrompt(business);
    for (const faq of business.faqs) {
      expect(prompt).toContain(faq.question);
      expect(prompt).toContain(faq.answer);
    }
  });

  it("tells the model how to hand off when the answer is not in the knowledge base", () => {
    expect(buildAnswerSystemPrompt(business)).toContain(business.contact);
  });

  it("uses voseo or usted as configured by the business", () => {
    expect(buildAnswerSystemPrompt(business)).toMatch(/\bvos\b/);
    expect(buildAnswerSystemPrompt({ ...business, addressing: "usted" })).toMatch(/\busted\b/);
  });

  it("is deterministic so the provider can cache it", () => {
    expect(buildAnswerSystemPrompt(business)).toBe(buildAnswerSystemPrompt(structuredClone(business)));
  });

  // First eval run, 2026-10-08 (evals/rag-answers): 88% "sin inventar" and 76% "tono". The bot filled
  // gaps with plausible extras and slipped into voseo with formal businesses.
  it("forbids filling the gaps with extras that sound reasonable", () => {
    const prompt = buildAnswerSystemPrompt(business);
    for (const extra of ["servicios", "condiciones", "canales", "depende", "datos generales"]) {
      expect(prompt).toContain(extra);
    }
    // The derivation detector (src/domain/attention.ts) keys on the bot saying it lacks the data.
    expect(prompt).toContain("decí que no tenés esa información");
  });

  it("tells the model it does not know today's date or time", () => {
    expect(buildAnswerSystemPrompt(business)).toMatch(/No sabés qué día ni qué hora es/);
  });

  it("keeps a formal business formal from the greeting to the closing", () => {
    const formal = buildAnswerSystemPrompt({ ...business, addressing: "usted" });
    expect(formal).toMatch(/de usted en todas las oraciones/);
    for (const informal of ["podés", "tenés", "ayudarte"]) expect(formal).toContain(`«${informal}»`);
    expect(buildAnswerSystemPrompt(business)).not.toContain("«ayudarte»");
  });

  it("asks for short answers without formatting", () => {
    expect(buildAnswerSystemPrompt(business)).toMatch(/sin listas largas, títulos ni negritas/i);
  });
});
