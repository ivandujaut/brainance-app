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

  // QA on the preview (spec 006): the model rewords the contact, so matching the whole text missed real
  // derivations. The contact details themselves (phone, email, link, handle) are what the bot repeats.
  describe("when the reply rewords the contact", () => {
    const configured = "WhatsApp +54 9 11 5555-0000 (prueba), de lunes a sábado de 8 a 20";

    it("flags a reply that repeats the phone with different wording", () => {
      const reply =
        "No tengo esa información. Te recomiendo que nos consultes al WhatsApp +54 9 11 5555-0000 de lunes a sábado de 8 a 20.";
      expect(detectAttention({ visitorText: "¿Tienen estacionamiento?", reply, contact: configured })).toBe(
        "derivation",
      );
    });

    it.each([
      ["without the country code", "No tengo ese dato. Escribinos al 11 5555-0000."],
      ["with other separators", "No tengo ese dato. Escribinos al (11) 5555 0000."],
      ["as plain digits", "No tengo ese dato. Escribinos al 5491155550000."],
    ])("flags the phone %s", (_, reply) => {
      expect(detectAttention({ visitorText: "x", reply, contact: configured })).toBe("derivation");
    });

    it("flags an email in any case", () => {
      const reply = "No tengo esa información. Mandanos un mail a Ventas@Panaderia.com.ar y te respondemos.";
      expect(detectAttention({ visitorText: "x", reply, contact: "Email: ventas@panaderia.com.ar" })).toBe(
        "derivation",
      );
    });

    it("flags a link or a handle", () => {
      const contactWithLinks = "Instagram @panaderia.palermo o el formulario en panaderia.com.ar/contacto";
      expect(
        detectAttention({
          visitorText: "x",
          reply: "No tengo ese dato. Escribinos a @panaderia.palermo.",
          contact: contactWithLinks,
        }),
      ).toBe("derivation");
      expect(
        detectAttention({
          visitorText: "x",
          reply: "No puedo confirmarlo desde acá. Completá https://panaderia.com.ar/contacto",
          contact: contactWithLinks,
        }),
      ).toBe("derivation");
    });

    // QA of spec 011: an answer that also offers the contact is not a derivation. Flagging it filled
    // "Derivadas", marked the inbox and emailed the owner for questions the bot had answered.
    it.each([
      "Sí, hacemos tortas por encargo con 48 horas de anticipación. Para pedir, escribinos al WhatsApp +54 9 11 5555-0000.",
      "Sí, hacemos envíos en CABA. Para más detalles sobre zonas de cobertura, costos o tiempos de entrega, podés contactarnos por WhatsApp al +54 9 11 5555-0000 (de lunes a sábado de 8 a 20).",
    ])("does not flag an answer that also offers the contact: %j", (reply) => {
      expect(detectAttention({ visitorText: "¿Hacen tortas?", reply, contact: configured })).toBeNull();
    });

    // The prompt asks the bot to say it does not have the information and offer the contact
    // (src/domain/answer-prompt.ts); these are the ways it says so in the eval cases and the QA.
    it.each([
      "No tengo esa información en mis datos. Te recomiendo que nos consultes por WhatsApp al +54 9 11 5555-0000 (de lunes a sábado de 8 a 20) para preguntarle directamente al equipo sobre opciones sin TACC.",
      "No cuento con ese dato. Consultanos al WhatsApp +54 9 11 5555-0000.",
      "No te puedo confirmar el stock: escribinos al 11 5555-0000.",
      "IOMA no figura entre las coberturas que tengo cargadas. Consultá al 11 5555-0000.",
      "La limpieza cuesta $45.000. Sobre carillas no tengo información: escribinos al 11 5555-0000.",
      "Esa información no la tengo, pero podés escribirnos al 11 5555-0000.",
      "No sabría decirte. Escribinos al 11 5555-0000.",
    ])("flags a reply that says it lacks the data and offers the contact: %j", (reply) => {
      expect(detectAttention({ visitorText: "x", reply, contact: configured })).toBe("derivation");
    });

    it("does not flag a reply that lacks the data but does not offer the contact", () => {
      expect(detectAttention({ visitorText: "x", reply: "No tengo esa información.", contact: configured })).toBeNull();
    });

    it("does not flag other numbers, like hours, prices or a different phone", () => {
      for (const reply of [
        "Abrimos de lunes a sábado de 8 a 20.",
        "La torta para 10 personas sale $15.000.",
        "El envío llega en 24 a 48 horas.",
        "Podés llamar al 0800 555 1234 del correo.",
      ]) {
        expect(detectAttention({ visitorText: "x", reply, contact: configured })).toBeNull();
      }
    });

    it("falls back to the whole text when the contact has no phone, email or link", () => {
      const address = "Pasá por el local de Av. Corrientes 1234";
      expect(
        detectAttention({
          visitorText: "x",
          reply: "No tengo ese dato; te esperamos: pasá por el local de av. Corrientes 1234.",
          contact: address,
        }),
      ).toBe("derivation");
      expect(detectAttention({ visitorText: "x", reply: "Abrimos a las 8.", contact: address })).toBeNull();
    });
  });

  it("matches the contact regardless of case and spacing", () => {
    expect(detectAttention({ visitorText: "x", reply: "NO TENGO ESE DATO, escribinos por whatsapp  +54 9 341 555-0101", contact })).toBe(
      "derivation",
    );
  });
});
