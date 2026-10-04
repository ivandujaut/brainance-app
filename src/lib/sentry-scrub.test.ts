import { describe, expect, it } from "vitest";
import { scrubEvent } from "./sentry-scrub";

describe("scrubEvent", () => {
  it("removes request bodies, cookies and auth headers", () => {
    const event = scrubEvent({
      request: {
        url: "https://app.brainance.com/api/widget/x/messages",
        data: '{"visitorId":"v","text":"mi DNI es 30.123.456"}',
        cookies: { __session: "secreto" },
        headers: { cookie: "a=b", authorization: "Bearer x", "user-agent": "Chrome" },
        query_string: "visitorId=abc",
      },
    });
    expect(event.request).toEqual({
      url: "https://app.brainance.com/api/widget/x/messages",
      headers: { "user-agent": "Chrome" },
    });
  });

  it("keeps only the user id", () => {
    expect(scrubEvent({ user: { id: "user_1", email: "duena@example.com", ip_address: "1.2.3.4" } }).user).toEqual({ id: "user_1" });
  });

  it("redacts personal fields anywhere in extra, contexts and breadcrumbs", () => {
    const event = scrubEvent({
      extra: { domainId: "d1", text: "hola", nested: { email: "ana@example.com", answers: ["Tortas"], ok: 1 } },
      contexts: { lead: { message: "quiero hablar con alguien" } },
      breadcrumbs: [{ category: "fetch", data: { url: "/api/x", body: "{}", message: "texto" } }],
    });
    expect(event.extra).toEqual({ domainId: "d1", text: "[redacted]", nested: { email: "[redacted]", answers: "[redacted]", ok: 1 } });
    expect(event.contexts).toEqual({ lead: { message: "[redacted]" } });
    expect(event.breadcrumbs).toEqual([{ category: "fetch", data: { url: "/api/x", body: "[redacted]", message: "[redacted]" } }]);
  });

  it("leaves events without personal data unchanged", () => {
    const event = { message: "Lead notice failed", tags: { area: "email" } };
    expect(scrubEvent(event)).toEqual(event);
  });
});
