import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Spec 008, criterion 11: the account page is in Spanish and has no billing.
vi.mock("@/components/infobar", () => ({ default: () => null }));
vi.mock("@/actions/settings", () => ({ onUpdatePassword: vi.fn() }));

const { default: AccountPage } = await import("./page");

describe("account page", () => {
  // The beta has the light theme only: no theme picker.
  it("offers the password change, in Spanish, without theme picker or billing", () => {
    const html = renderToString(<AccountPage />);
    expect(html).not.toContain("Tema");
    expect(html).toContain("Cambiar contraseña");
    expect(html).not.toMatch(/Billing|Upgrade|Plan|Stripe/);
  });
});
