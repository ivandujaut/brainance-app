// Transactional email behind an interface (ADR 0006): Resend in production, the console elsewhere.

export type Email = { to: string; subject: string; text: string; html: string; replyTo?: string };

export interface EmailSender {
  send(email: Email): Promise<void>;
}

/** Development and E2E: prints the email instead of sending it. */
export const logSender: EmailSender = {
  async send(email) {
    console.info(`[email] to=${email.to} subject=${JSON.stringify(email.subject)}\n${email.text}`);
  },
};

type ResendOptions = { apiKey: string; from: string; fetch?: typeof fetch };

export const resendSender = ({ apiKey, from, fetch: request = fetch }: ResendOptions): EmailSender => ({
  async send({ to, subject, text, html, replyTo }) {
    const res = await request("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) throw new Error(`Resend rejected the email (${res.status}): ${await res.text()}`);
  },
});

const missingKey: EmailSender = {
  async send() {
    throw new Error("EMAIL_PROVIDER is resend but RESEND_API_KEY or EMAIL_FROM is missing");
  },
};

type Env = Partial<Record<"NODE_ENV" | "EMAIL_PROVIDER" | "RESEND_API_KEY" | "EMAIL_FROM", string>>;

export const resolveEmailSender = (env: Env = process.env): EmailSender => {
  const provider = env.EMAIL_PROVIDER ?? (env.NODE_ENV === "production" ? "resend" : "log");
  if (provider === "log") return logSender;
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return missingKey;
  return resendSender({ apiKey: env.RESEND_API_KEY, from: env.EMAIL_FROM });
};
