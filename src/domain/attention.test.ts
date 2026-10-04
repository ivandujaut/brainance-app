import { describe, expect, it } from "vitest";
import { asksForHuman, detectAttention } from "./attention";

const contact = "WhatsApp +54 9 341 555-0101";

describe("asksForHuman", () => {
  it.each([
    "quiero hablar con alguien",
    "¿Me atiende un humano?",
    "pasame con un asesor por favor",
    "Necesito hablar con una persona",
    "me podés comunicar con un vendedor?",
    "QUIERO HABLAR CON UNA PERSONA REAL",
    "hay alguien que me pueda atender?",
    "prefiero que me atienda una persona",
    "comunicame con atención al cliente",
  ])("detects %j", (text) => {
    expect(asksForHuman(text)).toBe(true);
  });

  it.each([
    "¿Hacen envíos?",
    "¿Cuánto sale una torta para 10 personas?",
    "hablame de los precios",
    "¿Los asesores trabajan los sábados?",
    "¿Alguien más preguntó por esto?",
  ])("ignores %j", (text) => {
    expect(asksForHuman(text)).toBe(false);
  });
});

describe("detectAttention", () => {
  it("flags a reply that refers the visitor to the business contact", () => {
    expect(
      detectAttention({ visitorText: "¿Tienen sin TACC?", reply: `No tengo esa información. Escribinos por ${contact}.`, contact }),
    ).toBe("derivation");
  });

  it("flags a visitor asking for a person, even if the bot answered", () => {
    expect(detectAttention({ visitorText: "quiero hablar con alguien", reply: "¡Claro! Te cuento…", contact })).toBe(
      "human_request",
    );
  });

  it("does not flag a normal answer", () => {
    expect(detectAttention({ visitorText: "¿Hacen envíos?", reply: "Sí, a todo el país.", contact })).toBeNull();
  });

  it("does not use an empty or missing contact as a match", () => {
    expect(detectAttention({ visitorText: "hola", reply: "¡Hola!", contact: "" })).toBeNull();
    expect(detectAttention({ visitorText: "hola", reply: "¡Hola!", contact: null })).toBeNull();
  });

  it("matches the contact regardless of case and spacing", () => {
    expect(detectAttention({ visitorText: "x", reply: "escribinos por whatsapp  +54 9 341 555-0101", contact })).toBe(
      "derivation",
    );
  });
});
