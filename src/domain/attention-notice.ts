import type { AttentionReason } from "./attention";

// Owner notices for conversations that need attention (spec 010): one email per episode, one
// reminder if the visitor keeps writing, a daily cap per site. Pure decisions; the server reads
// the room and sends.

export const ATTENTION_NOTICE_LIMITS = {
  /** Notices per site in a rolling day (criterion 5). */
  perSitePerDay: 20,
  /** Minimum silence after the first notice before reminding (criterion 2). */
  remindAfterMs: 30 * 60_000,
  /** Exchanges (visitor question + bot answer) quoted in the email (criterion 7). */
  exchanges: 3,
} as const;

export type AttentionNoticeInput = {
  reason: AttentionReason;
  /** The site's switch (criterion 6). */
  enabled: boolean;
  /** Whether the room was already flagged before this message: false starts an episode. */
  needsAttentionBefore: boolean;
  liveSince: Date | null;
  attentionNotifiedAt: Date | null;
  /** Notices sent in the current episode (first notice + reminder). */
  attentionNotices: number;
  /** Conversations of the site notified in the last 24 hours. */
  noticesToday: number;
  /** Whether the site's daily-cap notice already went out today (criterion 4). */
  capNoticedToday: boolean;
  now: Date;
};

export type AttentionNoticeDecision =
  | { action: "notify" }
  | { action: "remind" }
  | {
      action: "skip";
      why:
        | "disabled"
        | "owner_live"
        | "already_notified"
        | "already_reminded"
        | "cap_already_noticed"
        | "site_daily_limit";
    };

export const decideAttentionNotice = (input: AttentionNoticeInput): AttentionNoticeDecision => {
  if (!input.enabled) return { action: "skip", why: "disabled" };
  if (input.liveSince) return { action: "skip", why: "owner_live" };
  if (input.reason === "site_cap") {
    return input.capNoticedToday ? { action: "skip", why: "cap_already_noticed" } : { action: "notify" };
  }
  // A new episode: the owner attended the last one (the flag was cleared) or the room was never flagged.
  if (!input.needsAttentionBefore || input.attentionNotices === 0) {
    if (input.noticesToday >= ATTENTION_NOTICE_LIMITS.perSitePerDay) return { action: "skip", why: "site_daily_limit" };
    return { action: "notify" };
  }
  if (input.attentionNotices >= 2) return { action: "skip", why: "already_reminded" };
  const since = input.attentionNotifiedAt ? input.now.getTime() - input.attentionNotifiedAt.getTime() : Infinity;
  if (since < ATTENTION_NOTICE_LIMITS.remindAfterMs) return { action: "skip", why: "already_notified" };
  if (input.noticesToday >= ATTENTION_NOTICE_LIMITS.perSitePerDay) return { action: "skip", why: "site_daily_limit" };
  return { action: "remind" };
};

export type Exchange = { question: string; answer: string };

type EmailInput = {
  siteName: string;
  reason: AttentionReason;
  exchanges: readonly Exchange[];
  visitorEmail: string | null;
  conversationUrl: string;
  reminder: boolean;
};

const REASONS: Record<AttentionReason, string> = {
  derivation: "El bot derivó al contacto del negocio.",
  human_request: "El visitante pidió hablar con una persona.",
  site_cap: "El sitio llegó al tope diario: el bot deriva al contacto del negocio en vez de responder.",
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ");

/** Email to the owner about a conversation that needs them. Everything quoted is escaped in the HTML part. */
export const buildAttentionEmail = ({
  siteName,
  reason,
  exchanges,
  visitorEmail,
  conversationUrl,
  reminder,
}: EmailInput) => {
  const site = oneLine(siteName);
  const subject =
    reason === "site_cap"
      ? `Tu sitio ${site} llegó al tope de hoy`
      : reminder
        ? `Un cliente de ${site} sigue esperando tu respuesta`
        : `Un cliente de ${site} espera tu respuesta`;
  const intro = reminder ? "El visitante sigue esperando y volvió a escribir." : REASONS[reason];
  const noMessages = "Todavía no hay mensajes.";

  const text = [
    intro,
    "",
    ...(exchanges.length
      ? exchanges.flatMap((e) => [`Visitante: ${e.question}`, `Bot: ${e.answer}`, ""])
      : [noMessages, ""]),
    ...(visitorEmail
      ? [`Email del visitante: ${visitorEmail}`, "Respondé este email para escribirle directamente.", ""]
      : []),
    `Ver la conversación y tomar el control: ${conversationUrl}`,
  ].join("\n");

  const rows = exchanges
    .map(
      (e) =>
        `<p><strong>Visitante:</strong> ${escapeHtml(e.question)}<br><strong>Bot:</strong> ${escapeHtml(e.answer)}</p>`,
    )
    .join("");
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#0F172A">
<p>${escapeHtml(intro)}</p>
${rows || `<p>${noMessages}</p>`}
${visitorEmail ? `<p>Email del visitante: <strong>${escapeHtml(visitorEmail)}</strong><br>Respondé este email para escribirle directamente.</p>` : ""}
<p><a href="${escapeHtml(conversationUrl)}">Ver la conversación y tomar el control</a></p>
</div>`;

  return { subject, text, html, ...(visitorEmail ? { replyTo: visitorEmail } : {}) };
};
