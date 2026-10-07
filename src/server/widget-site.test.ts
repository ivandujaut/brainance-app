import { describe, expect, it } from "vitest";
import { DARK_TEXT, LIGHT_TEXT } from "@/domain/color-contrast";
import { DEFAULT_CONTACT, siteCapReply, toBusinessKnowledge, toPublicConfig, type WidgetSite } from "./widget-site";

type Bot = NonNullable<WidgetSite["chatBot"]>;
const bot: Bot = {
  welcomeMessage: "¡Hola!",
  icon: null,
  background: "#123456",
  description: "Panadería artesanal en Rosario.",
  addressing: "usted",
  contact: "WhatsApp +54 9 341 555-0101",
  leadCapture: true,
    dailyAnswerCap: null,
};
const site = (chatBot: Partial<Bot> | null): WidgetSite => ({
  id: "6f1c7f4e-1f3a-4c8e-9a3b-2d1e0f9c8b7a",
  name: "panaderia.com.ar",
  chatBot: chatBot && { ...bot, ...chatBot },
  helpdesk: [{ question: "¿Abren los domingos?", answer: "Sí, de 8 a 13." }],
  filterQuestions: [{ id: "0b8e9d3c-5a7f-4e21-8c6d-1f2a3b4c5d6e", question: "¿Qué estás buscando?" }],
});

describe("toBusinessKnowledge", () => {
  it("uses the business data the owner saved", () => {
    expect(toBusinessKnowledge(site({}))).toEqual({
      name: "panaderia.com.ar",
      description: "Panadería artesanal en Rosario.",
      addressing: "usted",
      contact: "WhatsApp +54 9 341 555-0101",
      faqs: [{ question: "¿Abren los domingos?", answer: "Sí, de 8 a 13." }],
    });
  });

  it("falls back to generic values when nothing was saved", () => {
    const knowledge = toBusinessKnowledge(site({ description: null, contact: null, addressing: "vos" }));
    expect(knowledge).toMatchObject({
      description: "el sitio web panaderia.com.ar",
      addressing: "vos",
      contact: DEFAULT_CONTACT,
    });
    expect(toBusinessKnowledge(site(null))).toMatchObject({ addressing: "vos", contact: DEFAULT_CONTACT });
  });

  it("ignores an unknown addressing value", () => {
    expect(toBusinessKnowledge(site({ addressing: "tú" })).addressing).toBe("vos");
  });
});

describe("toPublicConfig", () => {
  it("computes a readable text color from the owner's color", () => {
    expect(toPublicConfig(site({ background: "#123456" }))).toMatchObject({ background: "#123456", textColor: LIGHT_TEXT });
    expect(toPublicConfig(site({ background: "#FACC15" }))).toMatchObject({ textColor: DARK_TEXT });
  });

  it("uses the brand orange with dark text by default", () => {
    expect(toPublicConfig(site({ background: null }))).toMatchObject({ background: "#FFA947", textColor: DARK_TEXT });
  });

  it("never exposes the business data meant for the model", () => {
    const config = JSON.stringify(toPublicConfig(site({})));
    expect(config).not.toContain("WhatsApp");
    expect(config).not.toContain("Panadería artesanal");
  });
});

describe("toPublicConfig lead capture", () => {
  it("includes the qualifying questions when lead capture is on", () => {
    expect(toPublicConfig(site({}))).toMatchObject({
      leadCapture: true,
      leadQuestions: [{ id: "0b8e9d3c-5a7f-4e21-8c6d-1f2a3b4c5d6e", question: "¿Qué estás buscando?" }],
    });
  });

  it("hides the card and its questions when the owner turned it off", () => {
    expect(toPublicConfig(site({ leadCapture: false }))).toMatchObject({ leadCapture: false, leadQuestions: [] });
  });
});

describe("siteCapReply", () => {
  it("refers to the owner's contact, or the generic one", () => {
    expect(siteCapReply(site({}))).toContain("WhatsApp +54 9 341 555-0101");
    expect(siteCapReply(site({ contact: null }))).toContain(DEFAULT_CONTACT);
  });
});
