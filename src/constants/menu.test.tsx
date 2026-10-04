import { describe, expect, it } from "vitest";
import { SIDE_BAR_MENU } from "./menu";

// Spec 008, criterion 14: the menu only lists what exists in the beta, in Spanish.
describe("SIDE_BAR_MENU", () => {
  it("lists the beta sections", () => {
    expect(SIDE_BAR_MENU.map((m) => [m.label, m.path])).toEqual([
      ["Dashboard", "dashboard"],
      ["Conversaciones", "conversations"],
      ["Leads", "leads"],
      ["Cuenta", "settings"],
    ]);
  });
});
