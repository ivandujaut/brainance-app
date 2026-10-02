import { describe, expect, it, vi } from "vitest";
import { logSender, resendSender, resolveEmailSender } from ".";

const email = { to: "duena@example.com", subject: "Hola", text: "texto", html: "<p>texto</p>", replyTo: "ana@example.com" };

describe("resendSender", () => {
  it("posts the email to the Resend API", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    await resendSender({ apiKey: "re_test", from: "BrAInance <avisos@brainance.app>", fetch }).send(email);
    expect(fetch).toHaveBeenCalledWith("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer re_test", "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "BrAInance <avisos@brainance.app>",
        to: ["duena@example.com"],
        subject: "Hola",
        text: "texto",
        html: "<p>texto</p>",
        reply_to: "ana@example.com",
      }),
    });
  });

  it("fails when Resend rejects the email", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{"message":"domain not verified"}', { status: 403 }));
    await expect(resendSender({ apiKey: "re_test", from: "x@y.z", fetch }).send(email)).rejects.toThrow(/403/);
  });
});

describe("resolveEmailSender", () => {
  it("logs emails outside production unless told otherwise", () => {
    expect(resolveEmailSender({ NODE_ENV: "development" })).toBe(logSender);
    expect(resolveEmailSender({ NODE_ENV: "production", EMAIL_PROVIDER: "log" })).toBe(logSender);
  });

  it("uses Resend in production", () => {
    expect(resolveEmailSender({ NODE_ENV: "production", RESEND_API_KEY: "re_x", EMAIL_FROM: "a@b.c" })).not.toBe(logSender);
  });

  it("fails explicitly when Resend is selected without a key", async () => {
    await expect(resolveEmailSender({ NODE_ENV: "production" }).send(email)).rejects.toThrow(/RESEND_API_KEY/);
  });
});
