import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureError = vi.fn();
vi.mock("@/server/observability", () => ({ captureError: (...args: unknown[]) => captureError(...args) }));
vi.mock("@sentry/nextjs", () => ({ isInitialized: () => true, flush: vi.fn(async () => true) }));

const { GET } = await import("./route");

describe("GET /api/debug/sentry", () => {
  beforeEach(() => captureError.mockReset());
  afterEach(() => vi.unstubAllEnvs());

  it("does not exist in production", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const response = await GET();
    expect(response.status).toBe(404);
    expect(captureError).not.toHaveBeenCalled();
  });

  it("sends a test error with fake personal data, to check that it arrives redacted", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ sent: true });
    expect(captureError).toHaveBeenCalledTimes(1);
    const [error, context] = captureError.mock.calls[0];
    expect((error as Error).message).toMatch(/prueba de sentry/i);
    expect(context).toMatchObject({ area: "debug", extra: { probe: true } });
    // Keys the scrubber redacts (src/lib/sentry-scrub.ts): they must show up as [redacted] in Sentry.
    expect(context.extra).toHaveProperty("email");
    expect(context.extra).toHaveProperty("text");
  });
});
