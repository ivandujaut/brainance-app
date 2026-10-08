import { describe, expect, it } from "vitest";
import { fallbackReply, fallbackSuffix, ipDailyReply, siteCapReply } from "./fallback-reply";

// Spec 014: fixed replies that refer the visitor to the business, in the business's addressing.

const contact = "WhatsApp +54 9 341 555-0101";

describe("fallbackReply", () => {
  it("gives the contact when the model could not answer (criterion 1)", () => {
    expect(fallbackReply({ contact, addressing: "vos" })).toBe(
      "No pude responder tu consulta en este momento. Podés comunicarte con el negocio por WhatsApp +54 9 341 555-0101.",
    );
  });

  it("follows a formal business's addressing (criterion 5)", () => {
    expect(fallbackReply({ contact, addressing: "usted" })).toBe(
      "No pude responder su consulta en este momento. Puede comunicarse con el negocio por WhatsApp +54 9 341 555-0101.",
    );
  });
});

describe("siteCapReply", () => {
  it("keeps the daily cap reply for informal businesses", () => {
    expect(siteCapReply({ contact, addressing: "vos" })).toBe(
      "En este momento no puedo responder más consultas. Podés comunicarte con el negocio por WhatsApp +54 9 341 555-0101.",
    );
  });

  it("follows a formal business's addressing (criterion 5)", () => {
    expect(siteCapReply({ contact, addressing: "usted" })).toBe(
      "En este momento no puedo responder más consultas. Puede comunicarse con el negocio por WhatsApp +54 9 341 555-0101.",
    );
  });
});

describe("fallbackSuffix", () => {
  it("is the fallback alone when nothing arrived (criteria 1 and 3)", () => {
    expect(fallbackSuffix("", "Respaldo.")).toBe("Respaldo.");
    expect(fallbackSuffix("  \n", "Respaldo.")).toBe("Respaldo.");
  });

  it("starts a new paragraph after a partial answer (criterion 4)", () => {
    expect(fallbackSuffix("Sí, abrimos los domingos de", "Respaldo.")).toBe("\n\nRespaldo.");
  });
});

// Spec 015, criterion 2: a connection that sent too many messages today gets the contact.
describe("ipDailyReply", () => {
  it("gives the contact in the business's addressing", () => {
    expect(ipDailyReply({ contact, addressing: "vos" })).toBe(
      "Desde tu conexión se enviaron muchos mensajes hoy. Podés comunicarte con el negocio por WhatsApp +54 9 341 555-0101.",
    );
    expect(ipDailyReply({ contact, addressing: "usted" })).toBe(
      "Desde su conexión se enviaron muchos mensajes hoy. Puede comunicarse con el negocio por WhatsApp +54 9 341 555-0101.",
    );
  });
});
