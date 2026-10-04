import { afterEach, describe, expect, it, vi } from "vitest";

const sentry = vi.hoisted(() => ({ captureException: vi.fn(), captureMessage: vi.fn(), isInitialized: vi.fn() }));
vi.mock("@sentry/nextjs", () => sentry);

const { captureError, captureWarning } = await import("./observability");

describe("observability", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sentry.captureException.mockReset();
    sentry.captureMessage.mockReset();
  });

  it("goes to the console when Sentry is not configured", () => {
    sentry.isInitialized.mockReturnValue(false);
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    captureError(new Error("boom"), { area: "ai", domainId: "d1" });
    captureWarning("near cap", { area: "ai" });
    expect(error).toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
    expect(sentry.captureException).not.toHaveBeenCalled();
  });

  it("reports to Sentry with tags when configured", () => {
    sentry.isInitialized.mockReturnValue(true);
    const failure = new Error("boom");
    captureError(failure, { area: "widget", domainId: "d1", extra: { finishReason: "error" } });
    expect(sentry.captureException).toHaveBeenCalledWith(failure, {
      tags: { area: "widget", domainId: "d1" },
      extra: { finishReason: "error" },
    });
    captureWarning("Site near its daily AI cost cap", { area: "ai", domainId: "d1" });
    expect(sentry.captureMessage).toHaveBeenCalledWith("Site near its daily AI cost cap", {
      level: "warning",
      tags: { area: "ai", domainId: "d1" },
      extra: undefined,
    });
  });
});
