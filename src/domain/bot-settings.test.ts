import { describe, expect, it } from "vitest";
import {
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

  it("accepts an uploaded icon id or no icon", () => {
    expect(AppearanceSchema.parse({ ...valid, icon: "8d3c1f9e-0a6b-4a8e-9c1a-2f7f6b0e5d41" }).icon).toBe(
      "8d3c1f9e-0a6b-4a8e-9c1a-2f7f6b0e5d41",
    );
    expect(AppearanceSchema.safeParse({ ...valid, icon: "../otro" }).success).toBe(false);
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
