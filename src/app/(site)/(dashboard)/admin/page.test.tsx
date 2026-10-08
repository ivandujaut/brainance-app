import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Spec 007, criteria 14–15: only ADMIN_CLERK_IDS see the admin page.
const owner = vi.hoisted(() => ({ id: null as string | null }));
vi.mock("@/server/tenancy", () => ({ currentOwnerId: async () => owner.id }));
vi.mock("@/lib/prisma", () => ({ client: {} }));
vi.mock("@/server/admin-metrics", async (original) => ({
  ...(await original<typeof import("@/server/admin-metrics")>()),
  adminMetrics: async () => ({
    days: 1,
    capUsd: 2,
    totalCostUsd: 1.71,
    calls: 4,
    errorRate: 0.25,
    fallbacks: 3,
    latencyP50: 800,
    latencyP95: 3000,
    sites: [{ domainId: "d1", site: "cara.com.ar", owner: "Dueña", calls: 3, errors: 1, fallbacks: 3, costUsd: 1.7, spentTodayUsd: 1.7, nearCap: true }],
  }),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const { default: AdminPage } = await import("./page");
const render = async () => renderToString(await AdminPage({ searchParams: Promise.resolve({}) }));

describe("admin page", () => {
  beforeEach(() => {
    process.env.ADMIN_CLERK_IDS = "user_admin";
  });

  it("is not found for anyone outside ADMIN_CLERK_IDS", async () => {
    owner.id = "user_owner";
    await expect(render()).rejects.toThrow("NEXT_NOT_FOUND");
    owner.id = null;
    await expect(render()).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("shows cost per site, latency, error rate and sites near the cap to admins", async () => {
    owner.id = "user_admin";
    const html = await render();
    expect(html).toContain("cara.com.ar");
    expect(html).toContain("Cerca del tope");
    expect(html).toContain("0,8 s");
    expect(html).toContain("3,0 s");
    expect(html).toMatch(/25\s?%/);
  });

  // Spec 014, criterion 16.
  it("shows how many replies were sent because the model failed", async () => {
    owner.id = "user_admin";
    const html = await render();
    expect(html).toContain("Respuestas de respaldo");
    expect(html).toMatch(/data-testid="admin-fallbacks"[^>]*>[\s\S]*?3/);
    expect(html).toContain("Respaldo");
  });
});
