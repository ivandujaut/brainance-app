import { describe, expect, it } from "vitest";
import { leadsToCsv } from "./leads-csv";

const lead = {
  email: "ana@example.com",
  site: "panaderia.com.ar",
  createdAt: new Date("2026-10-02T15:30:00Z"),
  responses: [
    { question: "¿De qué ciudad sos?", answered: "Rosario" },
    { question: "¿Qué buscás?", answered: "Tortas, \"de cumpleaños\"" },
  ],
};

describe("leadsToCsv", () => {
  it("starts with a UTF-8 BOM and a header so Excel shows accents", () => {
    const csv = leadsToCsv([]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1)).toBe("Email,Sitio,Fecha,Respuestas\r\n");
  });

  it("writes one row per lead with the date in Argentina time", () => {
    const [, row] = leadsToCsv([lead]).slice(1).split("\r\n");
    expect(row).toBe(
      'ana@example.com,panaderia.com.ar,2026-10-02 12:30,"¿De qué ciudad sos? Rosario | ¿Qué buscás? Tortas, ""de cumpleaños"""',
    );
  });

  it.each(["=HYPERLINK(\"http://x\")", "+54 9 341", "-1", "@SUM(A1)", "\tx", "\rx"])(
    "neutralizes formulas in %j",
    (answered) => {
      const csv = leadsToCsv([{ ...lead, responses: [{ question: "", answered }] }]);
      const cell = csv.split("\r\n")[1].split(",").slice(3).join(",");
      expect(cell.replace(/^"/, "").startsWith("'")).toBe(true);
    },
  );

  it("neutralizes a formula in the email column too", () => {
    expect(leadsToCsv([{ ...lead, email: "=cmd@example.com" }]).split("\r\n")[1].startsWith("'=cmd")).toBe(true);
  });

  it("quotes cells with line breaks", () => {
    const csv = leadsToCsv([{ ...lead, responses: [{ question: "Nota", answered: "línea 1\nlínea 2" }] }]);
    expect(csv).toContain('"Nota línea 1\nlínea 2"');
  });
});
