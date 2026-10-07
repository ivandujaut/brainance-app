import { describe, expect, it } from "vitest";
import {
  ATTENTION_NOTICE_LIMITS,
  buildAttentionEmail,
  decideAttentionNotice,
  type AttentionNoticeInput,
} from "./attention-notice";

// Spec 010: when a conversation needs the owner, email them once per episode, remind once if the
// visitor keeps writing, and never flood them.

const now = new Date("2026-10-07T03:10:00Z");
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000);

const base: AttentionNoticeInput = {
  reason: "derivation",
  enabled: true,
  needsAttentionBefore: false,
  liveSince: null,
  attentionNotifiedAt: null,
  attentionNotices: 0,
  noticesToday: 0,
  capNoticedToday: false,
  now,
};

describe("decideAttentionNotice", () => {
  it("notifies the first time a conversation needs attention (criterion 1)", () => {
    expect(decideAttentionNotice(base)).toEqual({ action: "notify" });
    expect(decideAttentionNotice({ ...base, reason: "human_request" })).toEqual({ action: "notify" });
  });

  it("does not notify twice in the same episode (criterion 1)", () => {
    const flagged = { ...base, needsAttentionBefore: true, attentionNotifiedAt: minutesAgo(5), attentionNotices: 1 };
    expect(decideAttentionNotice(flagged)).toEqual({ action: "skip", why: "already_notified" });
  });

  it("reminds once when the visitor writes again 30 minutes after the notice (criterion 2)", () => {
    const waiting = { ...base, needsAttentionBefore: true, attentionNotifiedAt: minutesAgo(31), attentionNotices: 1 };
    expect(decideAttentionNotice(waiting)).toEqual({ action: "remind" });
    expect(decideAttentionNotice({ ...waiting, attentionNotifiedAt: minutesAgo(29) })).toEqual({
      action: "skip",
      why: "already_notified",
    });
    expect(decideAttentionNotice({ ...waiting, attentionNotices: 2, attentionNotifiedAt: minutesAgo(90) })).toEqual({
      action: "skip",
      why: "already_reminded",
    });
  });

  it("notifies again in a new episode, after the owner attended the previous one (criterion 1)", () => {
    // The owner's visit cleared the flag; the old notice timestamps are history.
    const newEpisode = {
      ...base,
      needsAttentionBefore: false,
      attentionNotifiedAt: minutesAgo(600),
      attentionNotices: 2,
    };
    expect(decideAttentionNotice(newEpisode)).toEqual({ action: "notify" });
  });

  it("stays quiet while the owner has the conversation (criterion 3)", () => {
    expect(decideAttentionNotice({ ...base, liveSince: minutesAgo(2) })).toEqual({ action: "skip", why: "owner_live" });
  });

  it("tells the owner about the daily cap once a day per site (criterion 4)", () => {
    expect(decideAttentionNotice({ ...base, reason: "site_cap" })).toEqual({ action: "notify" });
    expect(decideAttentionNotice({ ...base, reason: "site_cap", capNoticedToday: true })).toEqual({
      action: "skip",
      why: "cap_already_noticed",
    });
    // The cap notice is per site, not per conversation: it ignores the room's own counters.
    expect(
      decideAttentionNotice({ ...base, reason: "site_cap", needsAttentionBefore: true, attentionNotices: 1 }),
    ).toEqual({ action: "notify" });
  });

  it("stops at the site's daily limit of notices (criterion 5)", () => {
    expect(ATTENTION_NOTICE_LIMITS.perSitePerDay).toBe(20);
    expect(decideAttentionNotice({ ...base, noticesToday: 20 })).toEqual({ action: "skip", why: "site_daily_limit" });
    expect(decideAttentionNotice({ ...base, noticesToday: 19 })).toEqual({ action: "notify" });
  });

  it("respects the site's switch (criterion 6)", () => {
    expect(decideAttentionNotice({ ...base, enabled: false })).toEqual({ action: "skip", why: "disabled" });
    expect(decideAttentionNotice({ ...base, enabled: false, reason: "site_cap" })).toEqual({
      action: "skip",
      why: "disabled",
    });
  });
});

describe("buildAttentionEmail", () => {
  const exchanges = [
    { question: "¿Hacen envíos?", answer: "Sí, a todo el país." },
    { question: "¿Tienen sin TACC?", answer: "No tengo ese dato. Escribinos por WhatsApp +54 9 341 555-0101." },
  ];
  const input = {
    siteName: "panaderia.com.ar",
    reason: "derivation" as const,
    exchanges,
    visitorEmail: null,
    conversationUrl: "https://app.example/conversations?c=room-1",
    reminder: false,
  };

  it("says the site, the reason, the last exchanges and links to the conversation (criterion 7)", () => {
    const email = buildAttentionEmail(input);
    expect(email.subject).toBe("Un cliente de panaderia.com.ar espera tu respuesta");
    expect(email.text).toContain("El bot derivó al contacto");
    expect(email.text).toContain("Visitante: ¿Hacen envíos?");
    expect(email.text).toContain("Bot: Sí, a todo el país.");
    expect(email.text).toContain("Visitante: ¿Tienen sin TACC?");
    expect(email.text).toContain("https://app.example/conversations?c=room-1");
    expect(email.html).toContain('href="https://app.example/conversations?c=room-1"');
    expect(email.replyTo).toBeUndefined();
  });

  it("names each reason in Spanish (criterion 7)", () => {
    expect(buildAttentionEmail({ ...input, reason: "human_request" }).text).toContain(
      "El visitante pidió hablar con una persona",
    );
    const cap = buildAttentionEmail({ ...input, reason: "site_cap" });
    expect(cap.subject).toBe("Tu sitio panaderia.com.ar llegó al tope de hoy");
    expect(cap.text).toContain("El sitio llegó al tope diario");
    expect(cap.text).toContain("deriva");
  });

  it("replies to the visitor when they left their email (criterion 8)", () => {
    const email = buildAttentionEmail({ ...input, visitorEmail: "ana@example.com" });
    expect(email.replyTo).toBe("ana@example.com");
    expect(email.text).toContain("Email del visitante: ana@example.com");
    expect(email.text).toContain("Respondé este email para escribirle directamente.");
  });

  it("marks a reminder as such (criterion 2)", () => {
    const email = buildAttentionEmail({ ...input, reminder: true });
    expect(email.subject).toBe("Un cliente de panaderia.com.ar sigue esperando tu respuesta");
    expect(email.text).toContain("sigue esperando");
  });

  it("keeps the subject on one line and escapes the HTML (criterion 10)", () => {
    const email = buildAttentionEmail({
      ...input,
      siteName: "pan\nadería.com.ar",
      exchanges: [{ question: "<script>alert(1)</script>", answer: "Tom & Jerry" }],
    });
    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(email.html).toContain("Tom &amp; Jerry");
    expect(email.html).not.toContain("<script>");
  });

  it("explains an empty exchange list instead of leaving a hole (criterion 7)", () => {
    const email = buildAttentionEmail({ ...input, exchanges: [] });
    expect(email.text).toContain("Todavía no hay mensajes.");
  });
});
