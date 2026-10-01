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
});
