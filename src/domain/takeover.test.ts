import { describe, expect, it } from "vitest";
import { AUTO_RELEASE_MS, decideVisitorTurn, toModelHistory } from "./takeover";

const now = new Date("2026-10-04T12:00:00Z");
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000);

describe("decideVisitorTurn", () => {
  it("lets the bot answer when nobody took over", () => {
    expect(decideVisitorTurn({ liveSince: null, lastOwnerMessageAt: null, now })).toBe("bot");
  });

  it("keeps the bot quiet while the owner is attending", () => {
    expect(decideVisitorTurn({ liveSince: minutesAgo(5), lastOwnerMessageAt: null, now })).toBe("owner");
    expect(decideVisitorTurn({ liveSince: minutesAgo(90), lastOwnerMessageAt: minutesAgo(10), now })).toBe("owner");
  });

  it("hands the conversation back after 30 minutes without the owner writing", () => {
    expect(AUTO_RELEASE_MS).toBe(30 * 60 * 1000);
    expect(decideVisitorTurn({ liveSince: minutesAgo(31), lastOwnerMessageAt: null, now })).toBe("release");
    expect(decideVisitorTurn({ liveSince: minutesAgo(120), lastOwnerMessageAt: minutesAgo(31), now })).toBe("release");
  });

  it("ignores owner messages from before taking over", () => {
    expect(decideVisitorTurn({ liveSince: minutesAgo(40), lastOwnerMessageAt: minutesAgo(50), now })).toBe("release");
  });
});

describe("toModelHistory", () => {
  it("sends the owner's messages as the business's replies and drops system notices", () => {
    expect(
      toModelHistory([
        { role: "user", content: "¿Tienen sin TACC?" },
        { role: "assistant", content: "No tengo esa información." },
        { role: "system", content: "Ahora te atiende una persona de la panadería." },
        { role: "owner", content: "Sí, los jueves hacemos sin TACC." },
        { role: "system", content: "Te vuelve a atender el asistente virtual." },
      ]),
    ).toEqual([
      { role: "user", content: "¿Tienen sin TACC?" },
      { role: "assistant", content: "No tengo esa información." },
      { role: "assistant", content: "Sí, los jueves hacemos sin TACC." },
    ]);
  });
});
