import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { UsageSection } from "./usage-section";

// Spec 011, criteria 7, 8 and 12: the "Uso y tope" section of the site's settings.
vi.mock("@/actions/settings/bot", () => ({ onUpdateDailyAnswerCap: vi.fn() }));

const usage = { answersToday: 12, cap: 300, remaining: 288, ratio: 0.04, reached: false };

describe("UsageSection", () => {
  it("shows today's answers against the cap, a progress bar and what happens at the cap", () => {
    const html = renderToString(<UsageSection siteId="s1" usage={usage} dailyAnswerCap={null} />);
    expect(html).toContain('data-testid="section-uso"');
    expect(html).toContain("Hoy: 12 de 300 respuestas");
    expect(html).toContain('role="progressbar"');
    expect(html).toContain("width:4%");
    expect(html).toContain(
      "Cuando se llega al tope, el bot deja de responder con IA y deriva a tu contacto. No se apaga.",
    );
    expect(html).not.toContain("llegó al tope");
    // Blank input means the beta maximum.
    expect(html).toMatch(/id="daily-answer-cap"[^>]*value=""/);
    expect(html).toContain("Vacío: el máximo de la beta (300 por día)");
  });

  it("says in words when the site reached the cap, and shows the owner's cap", () => {
    const html = renderToString(
      <UsageSection
        siteId="s1"
        usage={{ answersToday: 20, cap: 20, remaining: 0, ratio: 1, reached: true }}
        dailyAnswerCap={20}
      />,
    );
    expect(html).toContain("Hoy: 20 de 20 respuestas");
    expect(html).toContain("Hoy el bot llegó al tope y está derivando");
    expect(html).toContain("width:100%");
    expect(html).toMatch(/id="daily-answer-cap"[^>]*value="20"/);
  });
});
