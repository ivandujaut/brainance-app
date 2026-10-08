import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { EvalSummary } from "@/domain/eval-summary";
import { Proofs } from "./proofs";

// Spec 013, criteria 5–8: the three proofs, built from the product's own copy and numbers.

const summary: EvalSummary = {
  ranAt: "2026-10-08",
  model: "anthropic/claude-haiku-4.5",
  cases: 76,
  reps: 2,
  answers: 152,
  metrics: { correcta: 0.9, sinInvento: 0.97, tono: 0.99 },
  byType: [],
  examples: [],
};

const text = (html: string) =>
  html
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

describe("Proofs", () => {
  const html = renderToString(<Proofs evalSummary={summary} />);
  const page = text(html);

  it("shows the owner's email as it is sent, with the way to clear it (criterion 5)", () => {
    expect(page).toContain("Un cliente de panaderia-ejemplo.com.ar espera tu respuesta");
    expect(page).toContain("El bot derivó al contacto del negocio.");
    expect(page).toContain("¿Ya le respondiste por otro medio? Marcala como atendida desde la conversación.");
    expect(page).toContain("Ver la conversación y tomar el control");
    expect(page).toMatch(/recuerda una sola vez/);
  });

  it("shows the honesty tiles of the panel and the published eval (criterion 6)", () => {
    for (const tile of ["Respuestas del bot", "Derivadas", "Pidieron una persona", "Tu tiempo de respuesta"]) {
      expect(page).toContain(tile);
    }
    const numbers = text(html.match(/<p[^>]*data-testid="eval-numbers"[^>]*>[\s\S]*?<\/p>/)?.[0] ?? "");
    expect(numbers).toMatch(/97\s?% de las respuestas/);
    expect(numbers).toMatch(/90\s?%/);
    expect(numbers).toContain("76 consultas");
    expect(text(html)).toContain("8 de octubre de 2026");
    expect(html).toContain('href="/como-medimos"');
  });

  it("shows today's usage against the cap the owner sets (criterion 8)", () => {
    expect(page).toContain("Hoy: 12 de 300 respuestas");
    expect(html).toContain('role="progressbar"');
    expect(page).toContain("entre 20 y 300");
    expect(page).toMatch(/no se apaga/i);
  });

  it("leaves the eval numbers out when no run is published (criterion 7)", () => {
    const empty = renderToString(<Proofs evalSummary={null} />);
    expect(empty).not.toContain('data-testid="eval-numbers"');
    expect(empty).toContain('href="/como-medimos"');
    expect(text(empty)).toContain("Respuestas del bot");
  });
});
