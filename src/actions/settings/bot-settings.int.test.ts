import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// Spec 004: the bot settings actions save, edit and delete as the owner. Isolation between tenants
// is covered in src/actions/tenant-isolation.int.test.ts.
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

const OWNER = "user_int_bot_settings";
vi.mock("@clerk/nextjs/server", () => ({ currentUser: async () => ({ id: OWNER }), clerkClient: async () => ({}) }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

describe.skipIf(!url)("bot settings actions", async () => {
  const { client: db } = await import("@/lib/prisma");
  const bot = await import("./bot");
  const { getWidgetSite, siteCapReply, toBusinessKnowledge, toPublicConfig } = await import("@/server/widget-site");
  let siteId: string;

  beforeEach(async () => {
    await db.user.deleteMany({ where: { clerkId: OWNER } });
    const owner = await db.user.create({
      data: {
        clerkId: OWNER,
        fullname: "Dueña",
        domains: { create: { name: "panaderia.com.ar", icon: "", chatBot: { create: { welcomeMessage: "Hola" } } } },
      },
      include: { domains: true },
    });
    siteId = owner.domains[0].id;
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId: OWNER } });
    await db.$disconnect();
  });

  const widgetSite = async () => (await getWidgetSite(db, siteId))!;

  it("onGetSiteSettings: returns everything the settings page shows", async () => {
    const settings = await bot.onGetSiteSettings(siteId);
    expect(settings).toMatchObject({
      id: siteId,
      name: "panaderia.com.ar",
      chatBot: { welcomeMessage: "Hola", addressing: "vos", description: null, contact: null, installedAt: null },
      helpdesk: [],
      filterQuestions: [],
    });
  });

  it("onUpdateBusinessInfo: the widget's bot uses the saved business data", async () => {
    const result = await bot.onUpdateBusinessInfo(siteId, {
      description: "Panadería artesanal en Rosario.",
      addressing: "usted",
      contact: "WhatsApp +54 9 341 555-0101",
    });
    expect(result.status).toBe(200);
    const site = await widgetSite();
    expect(toBusinessKnowledge(site)).toMatchObject({
      description: "Panadería artesanal en Rosario.",
      addressing: "usted",
      contact: "WhatsApp +54 9 341 555-0101",
    });
    expect(siteCapReply(site)).toContain("WhatsApp +54 9 341 555-0101");
  });

  it("onUpdateBusinessInfo: rejects invalid data without saving", async () => {
    const result = await bot.onUpdateBusinessInfo(siteId, { description: "x", addressing: "tú", contact: "" });
    expect(result.status).toBe(400);
    expect(toBusinessKnowledge(await widgetSite()).addressing).toBe("vos");
  });

  it("onUpdateAppearance: saves color, icon and welcome message", async () => {
    const icon = "8d3c1f9e-0a6b-4a8e-9c1a-2f7f6b0e5d41";
    const result = await bot.onUpdateAppearance(siteId, { background: "#123456", welcomeMessage: "¡Buen día!", icon });
    expect(result.status).toBe(200);
    expect(toPublicConfig(await widgetSite())).toMatchObject({
      name: "panaderia.com.ar",
      welcomeMessage: "¡Buen día!",
      icon,
      background: "#123456",
      textColor: "#FFFFFF",
    });
  });

  it("onUpdateAppearance: rejects a color that is not #RRGGBB", async () => {
    const result = await bot.onUpdateAppearance(siteId, { background: "red", welcomeMessage: "Hola", icon: null });
    expect(result.status).toBe(400);
    expect((await widgetSite()).chatBot?.background).toBeNull();
  });

  it("FAQs: create, edit and delete", async () => {
    expect((await bot.onCreateHelpDeskQuestion(siteId, { question: "¿Envíos?", answer: "Sí." })).status).toBe(200);
    const [faq] = (await widgetSite()).helpdesk;
    expect(faq).toEqual({ question: "¿Envíos?", answer: "Sí." });

    const id = (await db.helpDesk.findFirstOrThrow({ where: { domainId: siteId } })).id;
    expect((await bot.onUpdateHelpDeskQuestion(id, { question: "¿Hacen envíos?", answer: "A todo el país." })).status).toBe(200);
    expect((await widgetSite()).helpdesk).toEqual([{ question: "¿Hacen envíos?", answer: "A todo el país." }]);

    expect((await bot.onDeleteHelpDeskQuestion(id)).status).toBe(200);
    expect((await widgetSite()).helpdesk).toEqual([]);
  });

  it("FAQs: reject empty fields", async () => {
    expect((await bot.onCreateHelpDeskQuestion(siteId, { question: " ", answer: "Sí." })).status).toBe(400);
    expect((await widgetSite()).helpdesk).toEqual([]);
  });

  it("FAQs: at most 50 per site", async () => {
    await db.helpDesk.createMany({
      data: Array.from({ length: 50 }, (_, i) => ({ domainId: siteId, question: `¿Pregunta ${i}?`, answer: "Sí." })),
    });
    const result = await bot.onCreateHelpDeskQuestion(siteId, { question: "¿Una más?", answer: "No." });
    expect(result.status).toBe(400);
    expect(result.message).toContain("50");
    expect((await widgetSite()).helpdesk).toHaveLength(50);
  });

  it("qualifying questions: create and delete", async () => {
    expect((await bot.onCreateFilterQuestion(siteId, { question: "¿Cuál es tu email?" })).status).toBe(200);
    const id = (await db.filterQuestions.findFirstOrThrow({ where: { domainId: siteId } })).id;
    expect((await bot.onDeleteFilterQuestion(id)).status).toBe(200);
    expect(await db.filterQuestions.count({ where: { domainId: siteId } })).toBe(0);
  });

  // Spec 011, criteria 7, 8, 12 and 14: the owner's daily answer cap and today's usage.
  it("onUpdateDailyAnswerCap: saves a cap in range, clears it when blank, rejects the rest", async () => {
    expect((await bot.onUpdateDailyAnswerCap(siteId, { dailyAnswerCap: "20" })).status).toBe(200);
    expect((await widgetSite()).chatBot?.dailyAnswerCap).toBe(20);
    expect((await bot.onUpdateDailyAnswerCap(siteId, { dailyAnswerCap: "" })).status).toBe(200);
    expect((await widgetSite()).chatBot?.dailyAnswerCap).toBeNull();
    expect(await bot.onUpdateDailyAnswerCap(siteId, { dailyAnswerCap: "19" })).toMatchObject({
      status: 400,
      message: "El tope tiene que ser un número entero entre 20 y 300.",
    });
    expect((await bot.onUpdateDailyAnswerCap(siteId, { dailyAnswerCap: "301" })).status).toBe(400);
    expect((await widgetSite()).chatBot?.dailyAnswerCap).toBeNull();
  });

  it("onGetSiteUsage: today's bot answers against the cap in force", async () => {
    expect(await bot.onGetSiteUsage(siteId)).toEqual({ answersToday: 0, cap: 300, remaining: 300, ratio: 0, reached: false });
    const { addMessage, getOrCreateRoom } = await import("@/server/conversations");
    const room = await getOrCreateRoom(db, { domainId: siteId, visitorId: crypto.randomUUID() });
    for (let i = 0; i < 20; i++) {
      await addMessage(db, room, "user", `consulta ${i}`);
      await addMessage(db, room, "assistant", `respuesta ${i}`);
    }
    await addMessage(db, room, "owner", "Te atiendo yo.");
    expect(await bot.onGetSiteUsage(siteId)).toMatchObject({ answersToday: 20, cap: 300, reached: false });
    await bot.onUpdateDailyAnswerCap(siteId, { dailyAnswerCap: 20 });
    expect(await bot.onGetSiteUsage(siteId)).toEqual({ answersToday: 20, cap: 20, remaining: 0, ratio: 1, reached: true });
    expect(await bot.onGetSiteUsage(crypto.randomUUID())).toBeNull();
  });
});
