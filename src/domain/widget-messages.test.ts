import { describe, expect, it } from "vitest";
import { LOCAL_ID_PREFIX, mergeMessages, type WidgetMessage } from "./widget-messages";

// Spec 006 (QA of spec 011): the widget shows the visitor's message at once with a local copy, then
// polling brings what it was missing. The result must follow the order in which messages were stored.

const msg = (id: string, role: WidgetMessage["role"], content: string): WidgetMessage => ({ id, role, content });
const local = (id: string, role: WidgetMessage["role"], content: string) =>
  msg(`${LOCAL_ID_PREFIX}${id}`, role, content);

describe("mergeMessages", () => {
  it("puts what happened while the visitor was away before the visitor's new message", () => {
    const current = [
      msg("1", "user", "¿Tienen sin TACC?"),
      msg("2", "assistant", "No tengo esa información."),
      local("q", "user", "¿Tienen estacionamiento?"),
      local("q-reply", "assistant", "No tengo ese dato."),
    ];
    const incoming = [
      msg("3", "system", "Ahora te atiende una persona de panaderia.com.ar."),
      msg("4", "owner", "Hola, te atiendo yo"),
      msg("5", "system", "Te vuelve a atender el asistente virtual."),
      msg("6", "user", "¿Tienen estacionamiento?"),
      msg("7", "assistant", "No tengo ese dato."),
    ];
    expect(mergeMessages(current, incoming).map((m) => m.id)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
  });

  it("keeps messages not stored yet at the end", () => {
    const current = [msg("1", "user", "hola"), local("q", "user", "¿Hacen envíos?")];
    const incoming = [msg("2", "owner", "¡Hola!")];
    expect(mergeMessages(current, incoming).map((m) => m.id)).toEqual(["1", "2", `${LOCAL_ID_PREFIX}q`]);
  });

  it("skips messages already shown and places a re-sent one where it was stored", () => {
    // While live, the widget swaps the local id for the stored one before polling brings the rest.
    const current = [msg("1", "user", "hola"), msg("4", "user", "¿Siguen ahí?")];
    const incoming = [msg("3", "owner", "Sí, decime"), msg("4", "user", "¿Siguen ahí?")];
    expect(mergeMessages(current, incoming).map((m) => m.id)).toEqual(["1", "3", "4"]);
    expect(mergeMessages([msg("1", "user", "hola")], [msg("1", "user", "hola")])).toHaveLength(1);
  });

  it("replaces each local copy once, even when the visitor repeats the same text", () => {
    const current = [local("a", "user", "hola"), local("b", "user", "hola")];
    const merged = mergeMessages(current, [msg("1", "user", "hola")]);
    expect(merged.map((m) => m.id)).toEqual(["1", `${LOCAL_ID_PREFIX}b`]);
  });
});
