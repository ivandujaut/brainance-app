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

  type Options = {
    answered?: boolean;
    lead?: boolean;
    /** Spec 011: why the room needed attention; a derivation marks the answer as derived. */
    attention?: "derivation" | "human_request";
    /** Minutes until the owner's first message after the room was flagged (spec 011, criterion 3). */
    attendedAfter?: number;
    /** A person attended the whole conversation: no bot answer at all (spec 011, criterion 4). */
    live?: boolean;
  };

  const conversation = async (
    domainId: string,
    at: Date,
    { answered = true, lead = false, attention, attendedAfter, live = false }: Options = {},
  ) => {
    const answerAt = new Date(at.getTime() + 1000);
    await db.customer.create({
      data: {
        domainId,
        visitorId: crypto.randomUUID(),
        ...(lead && { email: "ana@example.com", leadAt: at }),
        chatRoom: {
          create: {
            lastMessageAt: at,
            ...(attention && { attentionReason: attention, needsAttention: !attendedAfter, attentionAt: answerAt }),
            ...(live && { liveSince: at }),
            message: {
              create: [
                { role: "user", message: "hola", createdAt: at },
                ...(answered && !live
                  ? [{ role: "assistant" as const, message: "¡Hola!", createdAt: answerAt, derivation: attention === "derivation" }]
                  : []),
                ...(live ? [{ role: "owner" as const, message: "Te atiendo yo.", createdAt: answerAt }] : []),
                ...(attendedAfter
                  ? [{ role: "owner" as const, message: "Acá estoy.", createdAt: new Date(answerAt.getTime() + attendedAfter * 60_000) }]
                  : []),
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
    await conversation(panaderia, daysAgo(1), { attention: "derivation", attendedAfter: 10 });
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

  // Spec 011, criteria 1–5: honesty metrics.
  it("counts the bot's answers, how many derived, who asked for a person and the owner's response time", async () => {
    let metrics = await onGetOwnerMetrics({ days: 7 });
    expect(metrics).toMatchObject({ answers: 3, derived: 1, humanRequests: 0, responseTime: { medianMinutes: 10, cases: 1 } });
    expect(metrics!.derivationRate).toBeCloseTo(1 / 3);

    await conversation(panaderia, daysAgo(2), { attention: "human_request", attendedAfter: 30 });
    // Flagged but never attended: it does not count as a response time.
    await conversation(panaderia, daysAgo(2), { attention: "derivation" });
    // Attended by a person from the start: the owner's messages are not bot answers.
    await conversation(panaderia, daysAgo(3), { live: true });
    metrics = await onGetOwnerMetrics({ days: 7 });
    expect(metrics).toMatchObject({ conversations: 7, answers: 5, derived: 2, humanRequests: 1, needingAttention: 3 });
    expect(metrics!.derivationRate).toBeCloseTo(2 / 5);
    expect(metrics!.responseTime).toEqual({ medianMinutes: 10, cases: 2 });
    expect(await onGetOwnerMetrics({ days: 7, siteId: taller })).toMatchObject({ answers: 1, derived: 0, humanRequests: 0, responseTime: null });
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
    // Spec 011, criterion 5: no answers means no rate, not NaN or a misleading 0%.
    expect(metrics).toMatchObject({ answers: 0, derived: 0, derivationRate: null, humanRequests: 0, responseTime: null });
    expect(metrics!.series.every((d) => d.conversations === 0 && d.leads === 0)).toBe(true);
  });

  it("ignores a site that is not the owner's", async () => {
    expect(await onGetOwnerMetrics({ days: 7, siteId: crypto.randomUUID() })).toBeNull();
  });
});
