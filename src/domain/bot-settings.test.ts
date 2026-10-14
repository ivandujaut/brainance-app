import { describe, expect, it } from "vitest";
import {
  defaultWelcome,
  looksInformal,
  welcomeNeedsReview,
  welcomeForAddressing,
  AppearanceSchema,
  BusinessInfoSchema,
  canAddFaq,
  FaqSchema,
  FilterQuestionSchema,
  MAX_FAQS,
  SUGGESTED_COLORS,
} from "./bot-settings";
import { isHexColor } from "./color-contrast";

describe("BusinessInfoSchema", () => {
  const valid = { description: "Panadería de barrio en Rosario.", addressing: "usted", contact: "WhatsApp +54 9 341 555-0101" };

  it("accepts and trims the business data", () => {
    expect(BusinessInfoSchema.parse({ ...valid, description: "  Panadería.  " })).toEqual({ ...valid, description: "Panadería." });
  });

  it("allows leaving description and contact empty, stored as null", () => {
    expect(BusinessInfoSchema.parse({ description: " ", addressing: "vos", contact: "" })).toEqual({
      description: null,
      addressing: "vos",
      contact: null,
    });
  });

  it("only accepts vos or usted", () => {
    expect(BusinessInfoSchema.safeParse({ ...valid, addressing: "tú" }).success).toBe(false);
  });

  it("limits description to 1000 characters and contact to 200", () => {
    expect(BusinessInfoSchema.safeParse({ ...valid, description: "a".repeat(1000) }).success).toBe(true);
    expect(BusinessInfoSchema.safeParse({ ...valid, description: "a".repeat(1001) }).success).toBe(false);
    expect(BusinessInfoSchema.safeParse({ ...valid, contact: "a".repeat(200) }).success).toBe(true);
    expect(BusinessInfoSchema.safeParse({ ...valid, contact: "a".repeat(201) }).success).toBe(false);
  });
});

describe("AppearanceSchema", () => {
  const valid = { background: "#FFA947", welcomeMessage: "¡Hola! ¿En qué te ayudo?", icon: null };

  it("accepts a hex color and normalizes it to upper case", () => {
    expect(AppearanceSchema.parse({ ...valid, background: "#ffa947" }).background).toBe("#FFA947");
  });

  it.each(["red", "#FFF", "FFA947", "#12345G"])("rejects the color %s", (background) => {
    const result = AppearanceSchema.safeParse({ ...valid, background });
    expect(result.success).toBe(false);
  });

  it("requires a welcome message of up to 300 characters", () => {
    expect(AppearanceSchema.safeParse({ ...valid, welcomeMessage: "  " }).success).toBe(false);
    expect(AppearanceSchema.safeParse({ ...valid, welcomeMessage: "a".repeat(301) }).success).toBe(false);
  });

  it("accepts an uploaded icon URL or no icon (ADR 0011)", () => {
    const icon = "https://abc123xyz.public.blob.vercel-storage.com/icons/icon-Xy9aBc.png";
    expect(AppearanceSchema.parse({ ...valid, icon }).icon).toBe(icon);
    expect(AppearanceSchema.parse({ ...valid, icon: null }).icon).toBeNull();
    for (const other of ["../otro", "https://evil.example.com/icons/x.png", "8d3c1f9e-0a6b-4a8e-9c1a-2f7f6b0e5d41"]) {
      expect(AppearanceSchema.safeParse({ ...valid, icon: other }).success).toBe(false);
    }
  });

  it("suggests only valid colors", () => {
    expect(SUGGESTED_COLORS.every(isHexColor)).toBe(true);
  });
});

describe("FaqSchema", () => {
  it("requires a question of up to 200 characters and an answer of up to 1000", () => {
    expect(FaqSchema.parse({ question: " ¿Envíos? ", answer: " Sí. " })).toEqual({ question: "¿Envíos?", answer: "Sí." });
    expect(FaqSchema.safeParse({ question: "", answer: "Sí." }).success).toBe(false);
    expect(FaqSchema.safeParse({ question: "¿Envíos?", answer: " " }).success).toBe(false);
    expect(FaqSchema.safeParse({ question: "a".repeat(201), answer: "Sí." }).success).toBe(false);
    expect(FaqSchema.safeParse({ question: "¿Envíos?", answer: "a".repeat(1001) }).success).toBe(false);
  });
});

describe("FilterQuestionSchema", () => {
  it("requires a question of up to 200 characters", () => {
    expect(FilterQuestionSchema.safeParse({ question: " " }).success).toBe(false);
    expect(FilterQuestionSchema.safeParse({ question: "a".repeat(201) }).success).toBe(false);
    expect(FilterQuestionSchema.parse({ question: "¿Cuál es tu email?" })).toEqual({ question: "¿Cuál es tu email?" });
  });
});

describe("canAddFaq", () => {
  it("allows up to 50 FAQs per site", () => {
    expect(MAX_FAQS).toBe(50);
    expect(canAddFaq(49)).toBe(true);
    expect(canAddFaq(50)).toBe(false);
  });
});

// QA of spec 013: with "De usted" the chat still greeted in voseo, because every new site gets our
// default welcome and the owner rarely changes it.
describe("welcome and addressing", () => {
  it("has a default welcome for each addressing", () => {
    expect(defaultWelcome("vos")).toBe("¡Hola! ¿Tenés alguna consulta? Escribinos acá.");
    expect(defaultWelcome("usted")).toBe("¡Hola! ¿Tiene alguna consulta? Escríbanos acá.");
    expect(looksInformal(defaultWelcome("usted"))).toBe(false);
  });

  it("swaps our own default welcome when the addressing changes, and leaves the owner's text alone", () => {
    expect(welcomeForAddressing(defaultWelcome("vos"), "usted")).toBe(defaultWelcome("usted"));
    expect(welcomeForAddressing(defaultWelcome("usted"), "vos")).toBe(defaultWelcome("vos"));
    // An older default the widget used before.
    expect(welcomeForAddressing("¡Hola! ¿En qué te puedo ayudar?", "usted")).toBe(defaultWelcome("usted"));
    expect(welcomeForAddressing(null, "usted")).toBe(defaultWelcome("usted"));
    expect(welcomeForAddressing("  ", "usted")).toBe(defaultWelcome("usted"));
    expect(welcomeForAddressing("¡Bienvenido a la panadería! ¿Qué te tienta hoy?", "usted")).toBe(
      "¡Bienvenido a la panadería! ¿Qué te tienta hoy?",
    );
  });

  it.each([
    "¡Hola! ¿Tenés alguna consulta? Escribinos acá.",
    "Hola, ¿en qué te ayudo?",
    "¿Querés saber nuestros horarios?",
    "Contanos qué necesitás",
    "Hola! podes escribirnos aca",
  ])("notices an informal welcome: %j", (text) => {
    expect(looksInformal(text)).toBe(true);
  });

  it.each([
    "¡Hola! ¿Tiene alguna consulta? Escríbanos acá.",
    "¡Buen día! ¿Qué está buscando?",
    "Bienvenido. ¿En qué puedo ayudarle?",
    "Estudio contable Ferreyra: consultas de lunes a viernes.",
  ])("does not flag a formal or neutral welcome: %j", (text) => {
    expect(looksInformal(text)).toBe(false);
  });
});

describe("welcomeNeedsReview", () => {
  it("asks the owner to review their own informal welcome when the business is formal", () => {
    expect(welcomeNeedsReview("¡Hola! ¿Querés ver el menú?", "usted")).toBe(true);
    expect(welcomeNeedsReview("¡Hola! ¿Querés ver el menú?", "vos")).toBe(false);
  });

  it("stays quiet about our own default, which follows the addressing on save", () => {
    expect(welcomeNeedsReview(defaultWelcome("vos"), "usted")).toBe(false);
    expect(welcomeNeedsReview(defaultWelcome("usted"), "usted")).toBe(false);
    expect(welcomeNeedsReview("¡Buen día! ¿Qué está buscando?", "usted")).toBe(false);
  });
});
