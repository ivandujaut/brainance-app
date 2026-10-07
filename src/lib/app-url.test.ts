import { afterEach, describe, expect, it, vi } from "vitest";
import { getAppUrl } from "./app-url";

// The links in owner emails (spec 010) and the install snippet must work after the deploy that
// made them is gone: in previews that is the branch URL, which also keeps the owner's session.
describe("getAppUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("prefers the configured public URL", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://brainance.example");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_BRANCH_URL", "brainance-app-git-develop-x.vercel.app");
    expect(getAppUrl()).toBe("https://brainance.example");
  });

  it("uses the branch URL in previews, not the deployment's unique URL", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_BRANCH_URL", "brainance-app-git-develop-x.vercel.app");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_URL", "brainance-abc123-x.vercel.app");
    expect(getAppUrl()).toBe("https://brainance-app-git-develop-x.vercel.app");
  });

  it("falls back to the deployment URL, then to localhost", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_BRANCH_URL", "");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_URL", "brainance-abc123-x.vercel.app");
    expect(getAppUrl()).toBe("https://brainance-abc123-x.vercel.app");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_URL", "");
    expect(getAppUrl()).toBe("http://localhost:3000");
  });
});
