import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// Spec 007, criterion 11 (amended in the QA of spec 011): the dashboard shows the metrics as soon as
// the owner's bot has a conversation, even before the checklist is complete.
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

let signedIn = "user_int_onboarding";
vi.mock("@clerk/nextjs/server", () => ({ currentUser: async () => ({ id: signedIn }), clerkClient: async () => ({}) }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

describe.skipIf(!url)("onboarding", async () => {
  const { client: db } = await import("@/lib/prisma");
  const { onGetOnboarding } = await import(".");
  const OWNER = "user_int_onboarding";
  const OTHER = "user_int_onboarding_other";
  let siteId: string;

  beforeEach(async () => {
    signedIn = OWNER;
    await db.user.deleteMany({ where: { clerkId: { in: [OWNER, OTHER] } } });
    const owner = await db.user.create({
      data: {
        clerkId: OWNER,
        fullname: "Dueña",
        domains: { create: { name: "onboarding.com.ar", icon: "", chatBot: { create: {} } } },
      },
      include: { domains: true },
    });
    siteId = owner.domains[0].id;
    await db.user.create({ data: { clerkId: OTHER, fullname: "Otra" } });
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId: { in: [OWNER, OTHER] } } });
    await db.$disconnect();
  });

  it("says whether the owner's sites already have conversations, and never counts another tenant's", async () => {
    expect(await onGetOnboarding()).toMatchObject({ completed: false, hasConversations: false });
    await db.customer.create({
      data: {
        domainId: siteId,
        visitorId: crypto.randomUUID(),
        chatRoom: { create: { message: { create: { role: "user", message: "hola" } } } },
      },
    });
    expect(await onGetOnboarding()).toMatchObject({ completed: false, hasConversations: true });
    signedIn = OTHER;
    expect(await onGetOnboarding()).toMatchObject({ hasConversations: false });
  });
});
