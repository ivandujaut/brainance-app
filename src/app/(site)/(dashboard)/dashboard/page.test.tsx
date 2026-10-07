import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Spec 007, criteria 11–12: the dashboard shows the bot's results once onboarding is complete.
const mocks = vi.hoisted(() => ({ onGetOnboarding: vi.fn(), onGetOwnerMetrics: vi.fn(), onGetSiteUsage: vi.fn() }));
vi.mock("@/actions/onboarding", () => ({ onGetOnboarding: mocks.onGetOnboarding, onMarkInstalled: vi.fn() }));
vi.mock("@/actions/metrics", () => ({ onGetOwnerMetrics: mocks.onGetOwnerMetrics }));
vi.mock("@/actions/settings/bot", () => ({ onGetSiteUsage: mocks.onGetSiteUsage }));
vi.mock("@/actions/leads", () => ({ onListLeadSites: async () => [{ id: "s1", name: "panaderia.com.ar" }] }));
vi.mock("@/components/infobar", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => {}, push: () => {} }) }));

const { default: DashboardPage } = await import("./page");
const render = async (params: Record<string, string> = {}) =>
  renderToString(await DashboardPage({ searchParams: Promise.resolve(params) }));

const series = (values: [number, number][]) =>
  values.map(([conversations, leads], i) => ({ day: `2026-10-0${i + 1}`, conversations, leads }));

describe("dashboard page", () => {
  beforeEach(() => {
    mocks.onGetOnboarding.mockReset().mockResolvedValue({ completed: true, steps: [], site: null });
    mocks.onGetOwnerMetrics.mockReset().mockResolvedValue({
      days: 7,
      conversations: 12,
      answeredConversations: 10,
      leads: 3,
      captureRate: 0.3,
      needingAttention: 2,
      answers: 40,
      derived: 10,
      derivationRate: 0.25,
      humanRequests: 3,
      responseTime: { medianMinutes: 135, cases: 3 },
      series: series([[2, 1], [4, 0], [6, 2]]),
    });
    mocks.onGetSiteUsage.mockReset().mockResolvedValue({ answersToday: 12, cap: 300, remaining: 288, ratio: 0.04, reached: false });
  });

  it("shows the tiles and the daily chart", async () => {
    const html = await render();
    expect(html).toContain('data-testid="metric-conversations">12<');
    expect(html).toContain('data-testid="metric-leads">3<');
    expect(html).toMatch(/30\s?%/);
    expect(html).toContain('data-testid="metric-attention">2<');
    expect(html).toContain("Conversaciones y leads por día");
    expect(html).toContain("Ver como tabla");
  });

  // Spec 011, criteria 1, 3, 5, 11 and 12: honesty metrics and today's usage.
  it("shows the bot's answers, the derived ones, who asked for a person and the owner's response time", async () => {
    const html = await render();
    expect(html).toContain('data-testid="metric-answers">40<');
    expect(html).toContain('data-testid="metric-derived">10<');
    expect(html).toMatch(/25\s?% de las respuestas/);
    expect(html).toContain('data-testid="metric-human-requests">3<');
    expect(html).toContain('data-testid="metric-response-time">2 h 15 min<');
    expect(html).toContain("sobre 3 conversaciones que te necesitaron");
  });

  it("speaks in singular with a single case", async () => {
    mocks.onGetOwnerMetrics.mockResolvedValue({
      days: 7, conversations: 1, answeredConversations: 1, leads: 0, captureRate: 0, needingAttention: 1,
      answers: 2, derived: 1, derivationRate: 0.5, humanRequests: 0, responseTime: { medianMinutes: 1, cases: 1 },
      series: series([[1, 0]]),
    });
    expect(await render()).toContain("Mediana sobre 1 conversación que te necesitó");
  });

  it("shows a dash and 'Sin datos todavía' instead of NaN when there were no answers", async () => {
    mocks.onGetOwnerMetrics.mockResolvedValue({
      days: 7, conversations: 1, answeredConversations: 0, leads: 0, captureRate: 0, needingAttention: 0,
      answers: 0, derived: 0, derivationRate: null, humanRequests: 0, responseTime: null, series: series([[1, 0]]),
    });
    const html = await render();
    expect(html).toContain('data-testid="metric-derived">0<');
    expect(html).toContain("— de las respuestas");
    expect(html).toContain('data-testid="metric-response-time">Sin datos todavía<');
    expect(html).not.toContain("NaN");
  });

  it("shows today's usage with a link to the site's cap only when a site is chosen", async () => {
    let html = await render({ site: "s1" });
    expect(mocks.onGetSiteUsage).toHaveBeenLastCalledWith("s1");
    expect(html).toContain("Hoy: 12 de 300 respuestas");
    expect(html).toContain('href="/settings/s1#uso"');
    expect(html).not.toContain("llegó al tope");

    mocks.onGetSiteUsage.mockResolvedValue({ answersToday: 20, cap: 20, remaining: 0, ratio: 1, reached: true });
    html = await render({ site: "s1" });
    expect(html).toContain("Hoy: 20 de 20 respuestas");
    expect(html).toContain("Hoy el bot llegó al tope y está derivando");

    mocks.onGetSiteUsage.mockClear();
    html = await render();
    expect(mocks.onGetSiteUsage).not.toHaveBeenCalled();
    expect(html).not.toContain("Hoy:");
  });

  it("asks for 30 days and one site when chosen, ignoring foreign sites", async () => {
    await render({ days: "30", site: "s1" });
    expect(mocks.onGetOwnerMetrics).toHaveBeenLastCalledWith({ days: 30, siteId: "s1" });
    await render({ days: "90", site: "ajeno" });
    expect(mocks.onGetOwnerMetrics).toHaveBeenLastCalledWith({ days: 7, siteId: undefined });
  });

  it("says so in words when the period has no data", async () => {
    mocks.onGetOwnerMetrics.mockResolvedValue({
      days: 7, conversations: 0, answeredConversations: 0, leads: 0, captureRate: 0, needingAttention: 0,
      answers: 0, derived: 0, derivationRate: null, humanRequests: 0, responseTime: null, series: series([[0, 0], [0, 0]]),
    });
    const html = await render();
    expect(html).toContain('data-testid="metrics-empty"');
    expect(html).not.toContain("Ver como tabla");
  });

  it("keeps only the onboarding checklist while it is incomplete and nobody wrote yet", async () => {
    mocks.onGetOnboarding.mockResolvedValue({ completed: false, hasConversations: false, steps: [], site: null });
    const html = await render();
    expect(html).not.toContain("owner-metrics");
    expect(mocks.onGetOwnerMetrics).not.toHaveBeenCalled();
  });

  // QA of spec 011: a bot that already answers shows its metrics, with the checklist still on top.
  it("shows the metrics under the checklist once the bot has conversations", async () => {
    mocks.onGetOnboarding.mockResolvedValue({ completed: false, hasConversations: true, steps: [], site: null });
    const html = await render({ site: "s1" });
    expect(html).toContain('data-testid="onboarding-checklist"');
    expect(html).toContain('data-testid="owner-metrics"');
    expect(html.indexOf("onboarding-checklist")).toBeLessThan(html.indexOf("owner-metrics"));
    expect(html).toContain('data-testid="metric-answers">40<');
    expect(html).toContain("Hoy: 12 de 300 respuestas");
  });
});
