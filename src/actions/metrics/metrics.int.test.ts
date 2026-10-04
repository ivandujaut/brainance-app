import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// Spec 007, criteria 11–13: the owner's dashboard metrics.
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

const OWNER = "user_int_metrics";
vi.mock("@clerk/nextjs/server", () => ({ currentUser: async () => ({ id: OWNER }), clerkClient: async () => ({}) }));

describe.skipIf(!url)("owner metrics", async () => {
  const { client: db } = await import("@/lib/prisma");
  const { onGetOwnerMetrics } = await import(".");
  const { dayKey } = await import("@/domain/metrics");
  let panaderia: string;
  let taller: string;
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  const conversation = async (domainId: string, at: Date, { answered = true, lead = false, attention = false } = {}) => {
    await db.customer.create({
      data: {
        domainId,
        visitorId: crypto.randomUUID(),
        ...(lead && { email: "ana@example.com", leadAt: at }),
        chatRoom: {
          create: {
            lastMessageAt: at,
            ...(attention && { attentionReason: "derivation" }),
            message: {
              create: [
                { role: "user", message: "hola", createdAt: at },
                ...(answered ? [{ role: "assistant" as const, message: "¡Hola!", createdAt: new Date(at.getTime() + 1000) }] : []),
              ],
            },
          },
        },
      },
    });
  };

  beforeEach(async () => {
    await db.user.deleteMany({ where: { clerkId: OWNER } });
    const owner = await db.user.create({
      data: { clerkId: OWNER, fullname: "Dueña", domains: { create: [{ name: "panaderia.com.ar", icon: "" }, { name: "taller.com.ar", icon: "" }] } },
      include: { domains: { orderBy: { name: "asc" } } },
    });
    [panaderia, taller] = owner.domains.map((d) => d.id);
    await conversation(panaderia, daysAgo(1), { lead: true });
    await conversation(panaderia, daysAgo(1), { attention: true });
    await conversation(panaderia, daysAgo(2), { answered: false });
    await conversation(taller, daysAgo(3), { lead: true });
    await conversation(taller, daysAgo(20));
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId: OWNER } });
    await db.$disconnect();
  });

  it("adds up the last 7 days across the owner's sites", async () => {
    const metrics = await onGetOwnerMetrics({ days: 7 });
    expect(metrics).toMatchObject({ conversations: 4, leads: 2, answeredConversations: 3, needingAttention: 1 });
    expect(metrics!.captureRate).toBeCloseTo(2 / 3);
    expect(metrics!.series).toHaveLength(7);
    expect(metrics!.series.at(-2)).toEqual({ day: dayKey(daysAgo(1)), conversations: 2, leads: 1 });
  });

  it("widens to 30 days and filters by site", async () => {
    expect(await onGetOwnerMetrics({ days: 30 })).toMatchObject({ conversations: 5 });
    expect(await onGetOwnerMetrics({ days: 30, siteId: taller })).toMatchObject({ conversations: 2, leads: 1 });
  });

  it("returns zeros, not nothing, for a period without data", async () => {
    await db.chatMessage.deleteMany({ where: { ChatRoom: { Customer: { Domain: { User: { clerkId: OWNER } } } } } });
    await db.customer.updateMany({ where: { Domain: { User: { clerkId: OWNER } } }, data: { leadAt: null } });
    const metrics = await onGetOwnerMetrics({ days: 7 });
    expect(metrics).toMatchObject({ conversations: 0, leads: 0, captureRate: 0, needingAttention: 0 });
    expect(metrics!.series.every((d) => d.conversations === 0 && d.leads === 0)).toBe(true);
  });

  it("ignores a site that is not the owner's", async () => {
    expect(await onGetOwnerMetrics({ days: 7, siteId: crypto.randomUUID() })).toBeNull();
  });
});
