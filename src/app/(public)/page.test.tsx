import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home, { metadata } from "./page";

// Spec 013, criteria 1–4, 9 and 13: the landing tells the promise and its proofs.

const html = renderToString(<Home />);
const text = (fragment: string) =>
  fragment
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const headings = [...html.matchAll(/<h([12])[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => text(m[2]));

describe("landing", () => {
  it("leads with the promise (criterion 1)", () => {
    const h1 = text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)![1]);
    expect(h1).toBe("Ningún cliente sin respuesta. Y vos te enterás solo cuando hace falta.");
  });

  it("keeps the technology and the 24/7 line out of every title (criterion 1)", () => {
    expect(headings.length).toBeGreaterThanOrEqual(6);
    for (const heading of headings) {
      expect(heading).not.toMatch(/\bIA\b|inteligente|automatiz|24\/7|24 h|3 de la mañana/i);
    }
  });

  it("goes from the promise to the problem, the proofs, the steps, the beta and the call to action (criterion 2)", () => {
    const ids = ["promesa", "problema", "pruebas", "como-funciona", "beta", "empezar"];
    const positions = ids.map((id) => html.indexOf(`id="${id}"`));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("puts the problem in the owner's words, with questions answered and passed on (criterion 3)", () => {
    expect(headings).toContain("“Me escriben a cualquier hora y, si no contesto, se van a otro.”");
    expect(text(html)).toContain("Te la pasó a vos");
  });

  it("says the promise to search engines and when shared (criterion 4)", () => {
    expect(metadata.title).toBe("BrAInance · Ningún cliente sin respuesta");
    expect(metadata.description).toMatch(/no lo inventa/);
    expect(JSON.stringify(metadata)).not.toMatch(/Chatbots con IA/);
  });

  it("says what happens when the beta ends, linking to the terms (criterion 9)", () => {
    const beta = text(html.slice(html.indexOf('id="beta"'), html.indexOf('id="empezar"')));
    expect(beta).toContain("Qué pasa cuando termine la beta");
    for (const promise of ["30 días", "uno por local, en pesos", "tope", "no se cobra nada automáticamente", "CSV"]) {
      expect(beta).toContain(promise);
    }
    expect(html).toContain('href="/terminos"');
  });

  it("labels the product screenshots as an example (criterion 13)", () => {
    expect(text(html)).toContain("Panel de ejemplo, con datos ficticios.");
  });
});
