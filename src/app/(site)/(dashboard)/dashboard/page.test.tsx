import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Spec 007, criteria 11–12: the dashboard shows the bot's results once onboarding is complete.
const mocks = vi.hoisted(() => ({ onGetOnboarding: vi.fn(), onGetOwnerMetrics: vi.fn() }));
vi.mock("@/actions/onboarding", () => ({ onGetOnboarding: mocks.onGetOnboarding, onMarkInstalled: vi.fn() }));
vi.mock("@/actions/metrics", () => ({ onGetOwnerMetrics: mocks.onGetOwnerMetrics }));
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
      series: series([[2, 1], [4, 0], [6, 2]]),
    });
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

  it("asks for 30 days and one site when chosen, ignoring foreign sites", async () => {
    await render({ days: "30", site: "s1" });
    expect(mocks.onGetOwnerMetrics).toHaveBeenLastCalledWith({ days: 30, siteId: "s1" });
    await render({ days: "90", site: "ajeno" });
    expect(mocks.onGetOwnerMetrics).toHaveBeenLastCalledWith({ days: 7, siteId: undefined });
  });

  it("says so in words when the period has no data", async () => {
    mocks.onGetOwnerMetrics.mockResolvedValue({
      days: 7, conversations: 0, answeredConversations: 0, leads: 0, captureRate: 0, needingAttention: 0, series: series([[0, 0], [0, 0]]),
    });
    const html = await render();
    expect(html).toContain('data-testid="metrics-empty"');
    expect(html).not.toContain("Ver como tabla");
  });

  it("keeps the onboarding checklist until it is complete", async () => {
    mocks.onGetOnboarding.mockResolvedValue({ completed: false, steps: [], site: null });
    const html = await render();
    expect(html).not.toContain("owner-metrics");
    expect(mocks.onGetOwnerMetrics).not.toHaveBeenCalled();
  });
});
