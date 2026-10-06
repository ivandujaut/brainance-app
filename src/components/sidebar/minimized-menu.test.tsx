import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/sidebar/use-domain", () => ({ useDomain: () => ({ isDomain: undefined }) }));
vi.mock("../drawer", () => ({ default: () => null }));

const { MinMenu } = await import("./minimized-menu");

// The sidebar starts minimized and shows only icons: each link still needs its name, for screen
// readers and for the E2E tests that navigate by link name.
describe("minimized sidebar", () => {
  const html = renderToStaticMarkup(
    <MinMenu
      current="dashboard"
      onShrink={() => {}}
      onSignOut={() => {}}
      domains={[{ id: "8f0c2a43-6a1e-4c55-9a39-0d1e2b3c4d5e", name: "panaderia.com.ar", icon: null }]}
    />,
  );

  it.each(["Dashboard", "Conversaciones", "Leads", "Cuenta", "Cerrar sesión"])("names the %s link", (label) => {
    expect(html).toContain(`aria-label="${label}"`);
  });

  it("names each site link by its domain", () => {
    expect(html).toContain('aria-label="panaderia.com.ar"');
  });
});
