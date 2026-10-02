import { describe, expect, it } from "vitest";
import { buildLeadEmail } from "./lead-email";

const input = {
  siteName: "panaderia.com.ar",
  email: "ana@example.com",
  responses: [{ question: "¿Qué buscás?", answered: "Tortas" }],
  leadsUrl: "https://app.brainance.com/leads",
};

describe("buildLeadEmail", () => {
  it("tells the owner who left their data and where to see it", () => {
    const email = buildLeadEmail(input);
    expect(email.subject).toBe("Nuevo lead en panaderia.com.ar: ana@example.com");
    expect(email.replyTo).toBe("ana@example.com");
    for (const part of [email.text, email.html]) {
      expect(part).toContain("ana@example.com");
      expect(part).toContain("¿Qué buscás?");
      expect(part).toContain("Tortas");
      expect(part).toContain("https://app.brainance.com/leads");
    }
  });

  it("says so when the visitor answered no questions", () => {
    expect(buildLeadEmail({ ...input, responses: [] }).text).toContain("No respondió preguntas de calificación.");
  });

  it("escapes everything the visitor wrote in the HTML version", () => {
    const html = buildLeadEmail({
      ...input,
      responses: [{ question: "¿Qué buscás?", answered: '<img src=x onerror="alert(1)"><a href="https://phish">' }],
    }).html;
    expect(html).not.toContain("<img");
    expect(html).not.toContain('<a href="https://phish"');
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });

  it("keeps the subject on one line", () => {
    expect(buildLeadEmail({ ...input, siteName: "a.com\r\nBcc: x@y.z" }).subject).not.toMatch(/[\r\n]/);
  });
});
