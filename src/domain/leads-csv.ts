import type { LeadResponse } from "./leads";

export type CsvLead = { email: string; site: string; createdAt: Date; responses: readonly LeadResponse[] };

const date = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Argentina/Buenos_Aires",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Spreadsheets run cells starting with these as formulas (CSV injection). */
const FORMULA_START = /^[=+\-@\t\r]/;

const cell = (raw: string) => {
  const value = FORMULA_START.test(raw) ? `'${raw}` : raw;
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
};

/** Leads as CSV for Excel and Google Sheets: UTF-8 BOM, comma separator, CRLF rows (spec 005). */
export const leadsToCsv = (leads: readonly CsvLead[]) => {
  const rows = [
    ["Email", "Sitio", "Fecha", "Respuestas"],
    ...leads.map((lead) => [
      lead.email,
      lead.site,
      date.format(lead.createdAt),
      lead.responses.map((r) => (r.question ? `${r.question} ${r.answered}` : r.answered)).join(" | "),
    ]),
  ];
  return `﻿${rows.map((row) => row.map(cell).join(",")).join("\r\n")}\r\n`;
};
