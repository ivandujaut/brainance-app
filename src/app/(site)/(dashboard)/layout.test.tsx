import { isValidElement, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const onLoadAccount = vi.fn();
vi.mock("@/actions/auth", () => ({ onLoadAccount: () => onLoadAccount() }));
vi.mock("@/components/sidebar", () => ({ default: () => null }));

const { default: OwnerLayout } = await import("./layout");
const { AccountError } = await import("@/components/account-error");

const render = async () => (await OwnerLayout({ children: "contenido" })) as ReactElement;

describe("dashboard layout", () => {
  beforeEach(() => {
    onLoadAccount.mockReset();
  });

  it("renders the dashboard when the account loads", async () => {
    onLoadAccount.mockResolvedValue({ user: { id: "u1" }, domains: [] });
    const element = await render();
    expect(isValidElement(element)).toBe(true);
    expect(element.type).not.toBe(AccountError);
  });

  it("shows a retryable error instead of a blank page when the account cannot be loaded", async () => {
    onLoadAccount.mockRejectedValue(new Error("database unavailable"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const element = await render();
    consoleError.mockRestore();
    expect(element.type).toBe(AccountError);
  });

  it("lets Next.js redirects through", async () => {
    const redirect = Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;replace;/auth/sign-in;307;" });
    onLoadAccount.mockRejectedValue(redirect);
    await expect(render()).rejects.toBe(redirect);
  });
});
