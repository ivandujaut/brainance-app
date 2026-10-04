import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";

const observability = vi.hoisted(() => ({ captureWarning: vi.fn(), captureError: vi.fn() }));
vi.mock("@/server/observability", () => observability);

const { recordModelCall, siteCostState, siteSpendSince } = await import("./usage");

// Integration test (spec 007): needs a migrated Postgres in TEST_DATABASE_URL.
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("AI usage", () => {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  const clerkId = "user_int_test_usage";
  let siteId: string;
  let otherSite: string;

  const report = (overrides = {}) => ({
    servedModel: "claude-haiku-4-5-20251001",
    usage: { inputTokens: 2000, outputTokens: 300, cacheReadTokens: 0, cacheWriteTokens: 0 },
    latencyMs: 850,
    finishReason: "stop" as const,
    error: null,
    ...overrides,
  });

  beforeEach(async () => {
    observability.captureWarning.mockReset();
    await db.user.deleteMany({ where: { clerkId } });
    const user = await db.user.create({
      data: { clerkId, fullname: "Dueña", domains: { create: [{ name: "usage-a.com.ar", icon: "" }, { name: "usage-b.com.ar", icon: "" }] } },
      include: { domains: { orderBy: { name: "asc" } } },
    });
    [siteId, otherSite] = user.domains.map((d) => d.id);
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    await db.$disconnect();
  });

  it("records a call with its estimated cost, without any conversation text", async () => {
    await recordModelCall(db, { domainId: siteId, chatRoomId: null, purpose: "answer", requestedModel: "anthropic/claude-haiku-4.5", report: report() });
    const [call] = await db.modelCall.findMany({ where: { domainId: siteId } });
    expect(call).toMatchObject({
      purpose: "answer",
      requestedModel: "anthropic/claude-haiku-4.5",
      servedModel: "claude-haiku-4-5-20251001",
      inputTokens: 2000,
      outputTokens: 300,
      latencyMs: 850,
      finishReason: "stop",
      error: null,
    });
    expect(Number(call.costUsd)).toBeCloseTo(0.0035, 6);
  });

  it("records failed calls with their error", async () => {
    await recordModelCall(db, {
      domainId: siteId,
      chatRoomId: null,
      purpose: "answer",
      requestedModel: "anthropic/claude-haiku-4.5",
      report: report({ servedModel: null, usage: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 }, finishReason: "error", error: "provider down" }),
    });
    expect(await db.modelCall.findFirst({ where: { domainId: siteId } })).toMatchObject({ error: "provider down", servedModel: null });
  });

  it("stores no cost for unpriced models and warns once per model", async () => {
    const call = { domainId: siteId, chatRoomId: null, purpose: "answer", requestedModel: "openai/gpt-unpriced", report: report({ servedModel: "gpt-unpriced" }) };
    await recordModelCall(db, call);
    await recordModelCall(db, call);
    expect((await db.modelCall.findMany({ where: { domainId: siteId } })).every((c) => c.costUsd === null)).toBe(true);
    expect(observability.captureWarning).toHaveBeenCalledTimes(1);
  });

  it("prices by the requested model when the served id is unknown", async () => {
    await recordModelCall(db, { domainId: siteId, chatRoomId: null, purpose: "answer", requestedModel: "mock/echo", report: report({ servedModel: "echo" }) });
    expect(Number((await db.modelCall.findFirstOrThrow({ where: { domainId: siteId } })).costUsd)).toBe(0);
    expect(observability.captureWarning).not.toHaveBeenCalled();
  });

  it("adds up a site's spend in the window, ignoring other sites and older calls", async () => {
    await db.modelCall.createMany({
      data: [
        { domainId: siteId, purpose: "answer", requestedModel: "m", latencyMs: 1, costUsd: 0.5 },
        { domainId: siteId, purpose: "answer", requestedModel: "m", latencyMs: 1, costUsd: 0.25 },
        { domainId: siteId, purpose: "answer", requestedModel: "m", latencyMs: 1, costUsd: 9, createdAt: new Date(Date.now() - 25 * 3600 * 1000) },
        { domainId: otherSite, purpose: "answer", requestedModel: "m", latencyMs: 1, costUsd: 9 },
      ],
    });
    expect(await siteSpendSince(db, siteId, new Date(Date.now() - 24 * 3600 * 1000))).toBeCloseTo(0.75, 6);
  });

  it("warns once at 80% of the daily cap and blocks at the cap", async () => {
    await db.modelCall.create({ data: { domainId: siteId, purpose: "answer", requestedModel: "m", latencyMs: 1, costUsd: 1.7 } });
    expect(await siteCostState(db, siteId, 2)).toBe("warn");
    expect(await siteCostState(db, siteId, 2)).toBe("warn");
    expect(observability.captureWarning).toHaveBeenCalledTimes(1);

    await db.modelCall.create({ data: { domainId: siteId, purpose: "answer", requestedModel: "m", latencyMs: 1, costUsd: 0.3 } });
    expect(await siteCostState(db, siteId, 2)).toBe("blocked");
    expect(await siteCostState(db, otherSite, 2)).toBe("ok");
  });
});
