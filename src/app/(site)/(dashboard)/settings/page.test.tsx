import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Spec 008, criterion 11: the account page is in Spanish and has no billing.
vi.mock("@/components/infobar", () => ({ default: () => null }));
vi.mock("@/actions/settings", () => ({ onUpdatePassword: vi.fn() }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme: () => {} }) }));

const { default: AccountPage } = await import("./page");

describe("account page", () => {
  it("offers theme and password, in Spanish, without billing", () => {
    const html = renderToString(<AccountPage />);
    expect(html).toContain("Tema");
    expect(html).toContain("Cambiar contraseña");
    expect(html).not.toMatch(/Billing|Upgrade|Plan|Stripe/);
  });
});
