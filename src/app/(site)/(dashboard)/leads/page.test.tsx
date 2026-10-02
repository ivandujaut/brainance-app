import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Spec 005, criterion 12: the leads page lists the owner's leads and filters by site.
const onListLeads = vi.fn();
const onListLeadSites = vi.fn();
vi.mock("@/actions/leads", () => ({
  onListLeads: (site?: string) => onListLeads(site),
  onListLeadSites: () => onListLeadSites(),
}));

const { default: LeadsPage } = await import("./page");

const SITES = [
  { id: "6f1c7f4e-1f3a-4c8e-9a3b-2d1e0f9c8b7a", name: "panaderia.com.ar" },
  { id: "0b8e9d3c-5a7f-4e21-8c6d-1f2a3b4c5d6e", name: "taller.com.ar" },
];
const render = async (site?: string) => renderToString(await LeadsPage({ searchParams: Promise.resolve({ site }) }));

describe("leads page", () => {
  beforeEach(() => {
    onListLeads.mockReset().mockResolvedValue([
      {
        id: "c1",
        email: "ana@example.com",
        site: "panaderia.com.ar",
        createdAt: new Date("2026-10-02T15:30:00Z"),
        responses: [{ question: "¿Qué buscás?", answered: "Tortas" }],
      },
    ]);
    onListLeadSites.mockReset().mockResolvedValue(SITES);
  });

  it("lists the leads with site, date and answers", async () => {
    const html = await render();
    expect(html).toContain("ana@example.com");
    expect(html).toContain("panaderia.com.ar");
    expect(html).toContain("¿Qué buscás?");
    expect(html).toContain("Tortas");
    expect(html).toContain("Exportar CSV");
    expect(onListLeads).toHaveBeenCalledWith(undefined);
  });

  it("filters by one of the owner's sites and ignores any other id", async () => {
    await render(SITES[1].id);
    expect(onListLeads).toHaveBeenLastCalledWith(SITES[1].id);
    await render("11111111-2222-4333-8444-555555555555");
    expect(onListLeads).toHaveBeenLastCalledWith(undefined);
  });

  it("explains where leads come from when there are none", async () => {
    onListLeads.mockResolvedValue([]);
    expect(await render()).toContain("Todavía no hay leads");
  });
});
