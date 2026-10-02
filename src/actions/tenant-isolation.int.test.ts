import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Attack tests (ADR 0004): every server action that receives an id must act only on rows owned by
// the signed-in user. Each case runs as the owner (must work) and as another tenant (must not).
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

let signedIn: string | null = null;
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: async () => (signedIn ? { id: signedIn } : null),
  clerkClient: async () => ({}),
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

describe.skipIf(!url)("tenant isolation of server actions", async () => {
  const { client: db } = await import("@/lib/prisma");
  const conversation = await import("./conversation");
  const settings = await import("./settings");
  const bot = await import("./settings/bot");
  const leads = await import("./leads");

  const OWNER = "user_int_tenant_owner";
  const INTRUDER = "user_int_tenant_intruder";
  let siteId: string;
  let roomId: string;

  const as = (clerkId: string | null) => {
    signedIn = clerkId;
  };

  beforeAll(async () => {
    await db.user.deleteMany({ where: { clerkId: { in: [OWNER, INTRUDER] } } });
    await db.user.create({ data: { clerkId: INTRUDER, fullname: "Intruso", subscription: { create: {} } } });
  });

  beforeEach(async () => {
    // A fresh owner account with one site, its bot, one visitor conversation and one FAQ.
    await db.user.deleteMany({ where: { clerkId: OWNER } });
    const owner = await db.user.create({
      data: {
        clerkId: OWNER,
        fullname: "Dueña",
        subscription: { create: {} },
        domains: {
          create: {
            name: `owner-${Date.now()}.com.ar`,
            icon: "",
            chatBot: { create: { welcomeMessage: "Hola" } },
            helpdesk: { create: { question: "¿Envíos?", answer: "Sí." } },
            filterQuestions: { create: { question: "¿Cuál es tu email?" } },
            customer: {
              create: { email: "visitante@example.com", leadAt: new Date(), chatRoom: { create: { message: { create: { message: "hola", role: "user" } } } } },
            },
          },
        },
      },
      include: { domains: { include: { customer: { include: { chatRoom: true } } } } },
    });
    siteId = owner.domains[0].id;
    roomId = owner.domains[0].customer[0].chatRoom[0].id;
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId: { in: [OWNER, INTRUDER] } } });
    await db.$disconnect();
  });

  const room = () => db.chatRoom.findUniqueOrThrow({ where: { id: roomId }, include: { message: true } });
  const site = () =>
    db.domain.findUniqueOrThrow({
      where: { id: siteId },
      include: { chatBot: true, helpdesk: true, filterQuestions: true },
    });

  describe("conversations", () => {
    it("onToggleRealtime: only the owner can take over a conversation", async () => {
      as(INTRUDER);
      await conversation.onToggleRealtime(roomId, true);
      expect((await room()).live).toBe(false);

      as(OWNER);
      await conversation.onToggleRealtime(roomId, true);
      expect((await room()).live).toBe(true);
    });

    it("onGetConversationMode: hides other tenants' conversations", async () => {
      as(INTRUDER);
      expect(await conversation.onGetConversationMode(roomId)).toBeFalsy();
      as(OWNER);
      expect(await conversation.onGetConversationMode(roomId)).toEqual({ live: false });
    });

    it("onGetDomainChatRooms: does not list another tenant's visitors", async () => {
      as(INTRUDER);
      expect(JSON.stringify((await conversation.onGetDomainChatRooms(siteId)) ?? null)).not.toContain("visitante@example.com");
      as(OWNER);
      expect(JSON.stringify(await conversation.onGetDomainChatRooms(siteId))).toContain("visitante@example.com");
    });

    it("onGetChatMessages: does not return another tenant's messages", async () => {
      as(INTRUDER);
      expect(JSON.stringify((await conversation.onGetChatMessages(roomId)) ?? null)).not.toContain("hola");
      as(OWNER);
      expect(JSON.stringify(await conversation.onGetChatMessages(roomId))).toContain("hola");
    });

    it("onViewUnReadMessages: only the owner marks messages as seen", async () => {
      as(INTRUDER);
      await conversation.onViewUnReadMessages(roomId);
      expect((await room()).message.every((m) => !m.seen)).toBe(true);

      as(OWNER);
      await conversation.onViewUnReadMessages(roomId);
      expect((await room()).message.every((m) => m.seen)).toBe(true);
    });

    it("onOwnerSendMessage: nobody else can write into a conversation", async () => {
      as(INTRUDER);
      await conversation.onOwnerSendMessage(roomId, "mensaje intruso", "assistant");
      expect((await room()).message.map((m) => m.message)).not.toContain("mensaje intruso");

      as(OWNER);
      await conversation.onOwnerSendMessage(roomId, "respuesta del negocio", "assistant");
      expect((await room()).message.map((m) => m.message)).toContain("respuesta del negocio");
    });

    it("rejects anonymous callers", async () => {
      as(null);
      await conversation.onToggleRealtime(roomId, true);
      expect((await room()).live).toBe(false);
      expect(await conversation.onGetChatMessages(roomId)).toBeFalsy();
    });
  });

  describe("site settings", () => {
    it("onUpdatedDomain: only the owner renames the site", async () => {
      as(INTRUDER);
      await settings.onUpdatedDomain(siteId, "robado.com");
      expect((await site()).name).not.toBe("robado.com");

      as(OWNER);
      const renamed = `nuevo-${Date.now()}.com.ar`;
      await settings.onUpdatedDomain(siteId, renamed);
      expect((await site()).name).toBe(renamed);
    });

    it("onUpdatedDomain: another tenant's similar name does not block a rename", async () => {
      as(INTRUDER);
      await settings.onIntegrateDomain(`ana-${Date.now()}.com.ar`, "");
      const taken = (await db.domain.findFirstOrThrow({ where: { User: { clerkId: INTRUDER } } })).name;

      as(OWNER);
      const result = await settings.onUpdatedDomain(siteId, taken.replace(/^ana-/, "na-"));
      expect(result?.status).toBe(200);
    });

    it("onGetSiteSettings: hides another tenant's settings", async () => {
      as(INTRUDER);
      expect(await bot.onGetSiteSettings(siteId)).toBeNull();
      as(OWNER);
      expect(JSON.stringify(await bot.onGetSiteSettings(siteId))).toContain("¿Envíos?");
    });

    it("onUpdateBusinessInfo: only the owner edits the business data", async () => {
      const info = { description: "Negocio intruso", addressing: "usted", contact: "intruso@example.com" };
      as(INTRUDER);
      await bot.onUpdateBusinessInfo(siteId, info);
      expect((await site()).chatBot).toMatchObject({ description: null, addressing: "vos", contact: null });

      as(OWNER);
      await bot.onUpdateBusinessInfo(siteId, info);
      expect((await site()).chatBot).toMatchObject(info);
    });

    it("onUpdateAppearance: only the owner edits the bot's look", async () => {
      const look = { background: "#123456", welcomeMessage: "Bienvenida", icon: null };
      as(INTRUDER);
      await bot.onUpdateAppearance(siteId, { ...look, welcomeMessage: "Bienvenida intrusa" });
      expect((await site()).chatBot).toMatchObject({ background: null, welcomeMessage: "Hola" });

      as(OWNER);
      await bot.onUpdateAppearance(siteId, look);
      expect((await site()).chatBot).toMatchObject({ background: "#123456", welcomeMessage: "Bienvenida" });
    });

    it("FAQs: only the owner adds, edits and deletes them", async () => {
      const faqId = (await site()).helpdesk[0].id;
      as(INTRUDER);
      await bot.onCreateHelpDeskQuestion(siteId, { question: "¿Pregunta intrusa?", answer: "x" });
      await bot.onUpdateHelpDeskQuestion(faqId, { question: "¿Editada?", answer: "x" });
      await bot.onDeleteHelpDeskQuestion(faqId);
      expect((await site()).helpdesk.map((q) => q.question)).toEqual(["¿Envíos?"]);

      as(OWNER);
      await bot.onCreateHelpDeskQuestion(siteId, { question: "¿Horarios?", answer: "De 9 a 18." });
      await bot.onUpdateHelpDeskQuestion(faqId, { question: "¿Hacen envíos?", answer: "Sí." });
      expect((await site()).helpdesk.map((q) => q.question).sort()).toEqual(["¿Hacen envíos?", "¿Horarios?"]);
      await bot.onDeleteHelpDeskQuestion(faqId);
      expect((await site()).helpdesk.map((q) => q.question)).toEqual(["¿Horarios?"]);
    });

    it("qualifying questions: only the owner adds and deletes them", async () => {
      const questionId = (await site()).filterQuestions[0].id;
      as(INTRUDER);
      await bot.onCreateFilterQuestion(siteId, { question: "¿Pregunta intrusa?" });
      await bot.onDeleteFilterQuestion(questionId);
      expect((await site()).filterQuestions.map((q) => q.question)).toEqual(["¿Cuál es tu email?"]);

      as(OWNER);
      await bot.onCreateFilterQuestion(siteId, { question: "¿Cuál es tu teléfono?" });
      await bot.onDeleteFilterQuestion(questionId);
      expect((await site()).filterQuestions.map((q) => q.question)).toEqual(["¿Cuál es tu teléfono?"]);
    });

    it("onUpdateLeadSettings: only the owner turns lead capture off", async () => {
      as(INTRUDER);
      await bot.onUpdateLeadSettings(siteId, { leadCapture: false, leadEmail: false });
      expect((await site()).chatBot).toMatchObject({ leadCapture: true, leadEmail: true });

      as(OWNER);
      await bot.onUpdateLeadSettings(siteId, { leadCapture: false, leadEmail: true });
      expect((await site()).chatBot).toMatchObject({ leadCapture: false, leadEmail: true });
    });

    it("leads: only the owner lists, exports and deletes them", async () => {
      as(INTRUDER);
      expect(JSON.stringify(await leads.onListLeads())).not.toContain("visitante@example.com");
      expect(JSON.stringify(await leads.onListLeads(siteId))).not.toContain("visitante@example.com");
      expect(await leads.onExportLeads(siteId)).not.toContain("visitante@example.com");

      as(OWNER);
      const [lead] = await leads.onListLeads(siteId);
      expect(lead.email).toBe("visitante@example.com");
      expect(await leads.onExportLeads(siteId)).toContain("visitante@example.com");

      as(INTRUDER);
      await leads.onDeleteLead(lead.id);
      as(OWNER);
      expect(await leads.onListLeads(siteId)).toHaveLength(1);
      await leads.onDeleteLead(lead.id);
      expect(await leads.onListLeads(siteId)).toHaveLength(0);
    });

    it("onDeleteUserDomain: only the owner deletes the site", async () => {
      as(INTRUDER);
      await settings.onDeleteUserDomain(siteId);
      expect(await db.domain.findUnique({ where: { id: siteId } })).not.toBeNull();

      as(OWNER);
      await settings.onDeleteUserDomain(siteId);
      expect(await db.domain.findUnique({ where: { id: siteId } })).toBeNull();
    });

    it("rejects malformed ids without errors", async () => {
      as(OWNER);
      await expect(bot.onGetSiteSettings("../../etc")).resolves.toBeNull();
      await expect(bot.onDeleteHelpDeskQuestion("no-es-un-id")).resolves.toMatchObject({ status: 404 });
      await expect(conversation.onGetChatMessages("no-es-un-id")).resolves.toBeFalsy();
    });
  });
});
