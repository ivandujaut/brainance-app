import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { describeEvent, mediaToDownload, shortId, signatureMatches, verificationChallenge } from "./meta-webhook.mjs";

// The webhook capturer for the manual test with Meta's test number (docs/whatsapp-os/prueba-webhook-meta.md).
// The payloads follow the real ones from that test (docs/whatsapp-os/webhook-ejemplos/).

const secret = "app-secret-de-prueba";
const sign = (body: string, key = secret) => `sha256=${createHmac("sha256", key).update(body).digest("hex")}`;

const event = (value: object) => ({
  object: "whatsapp_business_account",
  entry: [{ id: "waba-1", changes: [{ field: "messages", value: { messaging_product: "whatsapp", ...value } }] }],
});
const message = (fields: object) => event({ messages: [{ from: "5491155550101", id: "wamid.A", timestamp: "1760400000", ...fields }] });

describe("signatureMatches", () => {
  const body = JSON.stringify(message({ type: "text", text: { body: "hola" } }));

  it("accepts the HMAC-SHA256 of the raw body with the app secret", () => {
    expect(signatureMatches(body, sign(body), secret)).toBe(true);
    expect(signatureMatches(Buffer.from(body), sign(body).toUpperCase().replace("SHA256=", "sha256="), secret)).toBe(true);
  });

  it("rejects another secret, a changed body or a malformed header", () => {
    expect(signatureMatches(body, sign(body, "otro"), secret)).toBe(false);
    expect(signatureMatches(`${body} `, sign(body), secret)).toBe(false);
    for (const header of [undefined, "", "sha256=", "md5=abc", sign(body).slice(7), "sha256=zz"]) {
      expect(signatureMatches(body, header, secret)).toBe(false);
    }
  });

  it("rejects everything when there is no secret", () => {
    expect(signatureMatches(body, sign(body, ""), "")).toBe(false);
  });
});

describe("verificationChallenge", () => {
  const params = (query: string) => new URLSearchParams(query);

  it("echoes the challenge when Meta subscribes with the right token", () => {
    expect(verificationChallenge(params("hub.mode=subscribe&hub.verify_token=tok&hub.challenge=123"), "tok")).toBe("123");
  });

  it("refuses another token, another mode or a missing token", () => {
    expect(verificationChallenge(params("hub.mode=subscribe&hub.verify_token=otro&hub.challenge=123"), "tok")).toBeNull();
    expect(verificationChallenge(params("hub.mode=unsubscribe&hub.verify_token=tok&hub.challenge=123"), "tok")).toBeNull();
    expect(verificationChallenge(params("hub.mode=subscribe&hub.verify_token=&hub.challenge=123"), "")).toBeNull();
  });
});

describe("shortId", () => {
  it("gives a short, stable stand-in for an id, without the id", () => {
    expect(shortId("wamid.A")).toMatch(/^#[0-9a-f]{6}$/);
    expect(shortId("wamid.A")).toBe(shortId("wamid.A"));
    expect(shortId("wamid.A")).not.toBe(shortId("wamid.B"));
  });
});

describe("describeEvent", () => {
  it("says what kind of message arrived, without the full number or the text", () => {
    const [line] = describeEvent(message({ type: "text", text: { body: "Entró el Gol de Pérez" } }));
    expect(line).toContain("mensaje text");
    expect(line).toContain("…0101");
    expect(line).toContain(shortId("wamid.A"));
    expect(line).toContain("21 caracteres");
    expect(line).not.toContain("5491155550101");
    expect(line).not.toContain("Gol");
  });

  it("never shows a real wamid, which carries the sender's number inside", () => {
    const inner = Buffer.concat([
      Buffer.from([0x1c, 0x18, 0x0d]),
      Buffer.from("5491155550101"),
      Buffer.from([0x15, 0x02, 0x00, 0x12, 0x18, 0x14]),
      Buffer.from("3A00000000000000000A"),
      Buffer.from([0x00]),
    ]);
    const wamid = `wamid.${inner.toString("base64")}`;
    const [line] = describeEvent(message({ id: wamid, type: "text", text: { body: "hola" }, context: { id: wamid } }));
    expect(line).not.toContain(wamid.slice("wamid.".length));
    expect(line).toContain(`responde a ${shortId(wamid)}`);
  });

  it("says which unsupported type arrived, like the album before three photos", () => {
    const [line] = describeEvent(
      message({ type: "unsupported", unsupported: { type: "album" }, errors: [{ code: 131051, title: "Message type unknown" }] }),
    );
    expect(line).toContain("mensaje unsupported");
    expect(line).toContain("album");
  });

  it("falls back to the business-scoped user id when a username hides the number", () => {
    const [line] = describeEvent(
      event({
        messages: [{ from_user_id: "AR.1000000000000001", id: "wamid.A", timestamp: "1760400000", type: "text", text: { body: "hola" } }],
      }),
    );
    expect(line).toContain("de usuario …0001");
    expect(line).not.toContain("AR.1000000000000001");
    expect(describeEvent(message({ type: "text", text: { body: "hola" }, from_user_id: "AR.1000000000000001" }))[0]).toContain("de …0101");
  });

  it("describes voice notes and photos with or without text", () => {
    const [voice] = describeEvent(
      message({ type: "audio", audio: { id: "media-1", mime_type: "audio/ogg; codecs=opus", voice: true } }),
    );
    expect(voice).toContain("audio/ogg; codecs=opus");
    expect(voice).toContain("nota de voz");
    const [photo] = describeEvent(message({ type: "image", image: { id: "media-2", mime_type: "image/jpeg", caption: "el Gol" } }));
    expect(photo).toContain("image/jpeg");
    expect(photo).toContain("con texto");
    expect(photo).not.toContain("el Gol");
  });

  it("marks reactions, replies and forwarded messages", () => {
    expect(describeEvent(message({ type: "reaction", reaction: { message_id: "wamid.B", emoji: "👍" } }))[0]).toContain(
      `reacción 👍 a ${shortId("wamid.B")}`,
    );
    expect(describeEvent(message({ type: "reaction", reaction: { message_id: "wamid.B" } }))[0]).toContain(
      `reacción quitada a ${shortId("wamid.B")}`,
    );
    const [reply] = describeEvent(message({ type: "text", text: { body: "sí" }, context: { from: "x", id: "wamid.C" } }));
    expect(reply).toContain(`responde a ${shortId("wamid.C")}`);
    const [forwarded] = describeEvent(
      message({ type: "audio", audio: { id: "media-3", mime_type: "audio/ogg" }, context: { forwarded: true } }),
    );
    expect(forwarded).toContain("reenviado");
  });

  it("lists delivery statuses, and says when a change has neither", () => {
    expect(describeEvent(event({ statuses: [{ id: "wamid.D", status: "delivered", recipient_id: "549" }] }))).toEqual([
      `estado delivered · ${shortId("wamid.D")}`,
    ]);
    expect(describeEvent(event({}))).toEqual(["cambio messages sin mensajes ni estados"]);
    expect(describeEvent({})).toEqual([]);
  });
});

describe("mediaToDownload", () => {
  it("lists the files to download right away, and nothing for text", () => {
    const body = event({
      messages: [
        { id: "wamid.1", type: "text", text: { body: "hola" } },
        { id: "wamid.2", type: "audio", audio: { id: "media-1" } },
        { id: "wamid.3", type: "image", image: { id: "media-2" } },
        { id: "wamid.4", type: "document", document: { id: "media-3", filename: "presupuesto.pdf" } },
      ],
    });
    expect(mediaToDownload(body)).toEqual([
      { messageId: "wamid.2", type: "audio", mediaId: "media-1" },
      { messageId: "wamid.3", type: "image", mediaId: "media-2" },
      { messageId: "wamid.4", type: "document", mediaId: "media-3" },
    ]);
  });
});
