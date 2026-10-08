import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { EvalSummary } from "@/domain/eval-summary";
import { HowWeMeasure } from "./how-we-measure";

// Spec 013, criterion 11: /como-medimos explains the method, the results and their limits.

const set = {
  cases: 76,
  businesses: 5,
  types: [
    { type: "respondible", label: "La respuesta está cargada", cases: 30 },
    { type: "no_en_kb", label: "El dato no está cargado", cases: 15 },
  ],
};
const summary: EvalSummary = {
  ranAt: "2026-10-08",
  model: "anthropic/claude-haiku-4.5",
  cases: 76,
  reps: 2,
  answers: 152,
  metrics: { correcta: 0.9, sinInvento: 0.97, tono: 0.99 },
  byType: [
    { type: "respondible", label: "La respuesta está cargada", cases: 30, answers: 60, correcta: 0.95, sinInvento: 1 },
    { type: "no_en_kb", label: "El dato no está cargado", cases: 15, answers: 30, correcta: 0.8, sinInvento: 0.93 },
  ],
  examples: [
    {
      type: "no_en_kb",
      label: "El dato no está cargado",
      question: "¿Toman IOMA?",
      answer: "Sí, trabajamos con IOMA.",
      correcta: false,
      sinInvento: false,
      reason: "IOMA no figura en las coberturas.",
    },
  ],
};
const text = (html: string) =>
  html
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

describe("HowWeMeasure", () => {
  it("explains the set, the grading and the limits", () => {
    const page = text(renderToString(<HowWeMeasure set={set} summary={summary} />));
    expect(page).toContain("76 consultas");
    expect(page).toContain("5 negocios");
    expect(page).toContain("La respuesta está cargada");
    for (const word of ["Correcta", "Sin inventar", "Tono"]) expect(page).toContain(word);
    expect(page).toMatch(/no salen de conversaciones reales/);
    expect(page).toMatch(/el juez también es una IA/);
    expect(page).toMatch(/±8 puntos/);
    // The prompt was tuned looking at this same set's failures: the page says so.
    expect(page).toMatch(/mirando los errores de este mismo set/);
  });

  it("shows the results by type and the examples, failures included", () => {
    const html = renderToString(<HowWeMeasure set={set} summary={summary} />);
    const page = text(html);
    expect(page).toContain("8 de octubre de 2026");
    expect(page).toContain("anthropic/claude-haiku-4.5");
    expect(page).toMatch(/80\s?%/);
    expect(page).toContain("¿Toman IOMA?");
    expect(page).toContain("Sí, trabajamos con IOMA.");
    expect(page).toContain("Incorrecta");
    expect(page).toContain("IOMA no figura en las coberturas.");
  });

  it("says when no run is published yet, and what it takes", () => {
    const page = text(renderToString(<HowWeMeasure set={set} summary={null} />));
    expect(page).toMatch(/Todavía no publicamos una corrida/);
    expect(page).toMatch(/95\s?% sin inventar/);
    expect(page).toMatch(/85\s?% correctas/);
    // Spec 016, criterion 8.
    expect(page).toMatch(/90\s?% sin inventar cuando el dato no está cargado/);
    expect(page).not.toContain("Incorrecta");
  });

  // Spec 016, criterion 6: how the panel counts derivations, and how well.
  it("explains how derivations are counted and how well the detector did", () => {
    const measured = { ...summary, detector: { shouldDerive: 40, counted: 38, shouldNotDerive: 90, falseAlarms: 2 } };
    const page = text(renderToString(<HowWeMeasure set={set} summary={measured} />));
    expect(page).toContain("Cómo contamos las derivaciones");
    expect(page).toMatch(/dice que no tiene el dato y repite tu contacto/);
    expect(page).toMatch(/contó 38 de 40 \(95\s?%\)/);
    expect(page).toMatch(/2 de 90 respuestas/);
    expect(page).toMatch(/no te llega el aviso/);
  });

  it("says the detector is measured from the next run when the published one did not (criterion 7)", () => {
    for (const s of [summary, null]) {
      const page = text(renderToString(<HowWeMeasure set={set} summary={s} />));
      expect(page).toContain("Cómo contamos las derivaciones");
      expect(page).toMatch(/empieza con la próxima corrida/);
    }
  });
});
