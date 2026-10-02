import type { LeadResponse } from "./leads";

type Input = { siteName: string; email: string; responses: readonly LeadResponse[]; leadsUrl: string };

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ");

/** Email to the owner about a new lead. Everything the visitor wrote is escaped in the HTML part. */
export const buildLeadEmail = ({ siteName, email, responses, leadsUrl }: Input) => {
  const noAnswers = "No respondió preguntas de calificación.";
  const text = [
    `Un visitante de ${siteName} dejó sus datos en el chat.`,
    "",
    `Email: ${email}`,
    "",
    ...(responses.length ? responses.map((r) => `${r.question}\n${r.answered}\n`) : [noAnswers, ""]),
    "Respondé este email para escribirle directamente.",
    `Todos tus leads: ${leadsUrl}`,
  ].join("\n");

  const rows = responses
    .map((r) => `<p><strong>${escapeHtml(r.question)}</strong><br>${escapeHtml(r.answered)}</p>`)
    .join("");
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#0F172A">
<p>Un visitante de <strong>${escapeHtml(siteName)}</strong> dejó sus datos en el chat.</p>
<p>Email: <strong>${escapeHtml(email)}</strong></p>
${rows || `<p>${noAnswers}</p>`}
<p>Respondé este email para escribirle directamente.</p>
<p><a href="${escapeHtml(leadsUrl)}">Ver todos tus leads</a></p>
</div>`;

  return { subject: oneLine(`Nuevo lead en ${siteName}: ${email}`), text, html, replyTo: email };
};
