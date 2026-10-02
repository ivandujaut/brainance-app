import type { BusinessKnowledge } from "@/domain/answer-prompt";
import { ADDRESSING, WIDGET_DEFAULT_COLOR, WIDGET_DEFAULT_WELCOME, type Addressing } from "@/domain/bot-settings";
import { isHexColor, readableTextColor } from "@/domain/color-contrast";
import type { PrismaClient } from "@/generated/prisma/client";

// Fallback until the owner saves a contact channel in the bot settings (spec 004).
export const DEFAULT_CONTACT = "los canales de contacto que figuran en este sitio";

/** Public data the widget needs about a site, or null if it does not exist. */
export const getWidgetSite = (db: PrismaClient, domainId: string) =>
  db.domain.findUnique({
    where: { id: domainId },
    select: {
      id: true,
      name: true,
      chatBot: {
        select: {
          welcomeMessage: true,
          icon: true,
          background: true,
          description: true,
          addressing: true,
          contact: true,
          leadCapture: true,
        },
      },
      helpdesk: { select: { question: true, answer: true } },
      filterQuestions: { select: { id: true, question: true }, orderBy: { question: "asc" } },
    },
  });

export type WidgetSite = NonNullable<Awaited<ReturnType<typeof getWidgetSite>>>;

type Look = { background?: string | null };

/** The owner's color (or the default) and the text color that reads best on it. */
export const widgetColors = (bot: Look | null) => {
  const background = bot?.background && isHexColor(bot.background) ? bot.background : WIDGET_DEFAULT_COLOR;
  return { background, textColor: readableTextColor(background) };
};

/**
 * What the visitor's browser may see: no FAQs and no business data for the model. The qualifying
 * questions are public: the visitor reads them in the lead card anyway (spec 005).
 */
export const toPublicConfig = (site: WidgetSite) => {
  const leadCapture = site.chatBot?.leadCapture !== false;
  return {
    name: site.name,
    welcomeMessage: site.chatBot?.welcomeMessage || WIDGET_DEFAULT_WELCOME,
    icon: site.chatBot?.icon || null,
    ...widgetColors(site.chatBot),
    leadCapture,
    leadQuestions: leadCapture ? site.filterQuestions : [],
  };
};

const isAddressing = (value: unknown): value is Addressing => ADDRESSING.includes(value as Addressing);

export const toBusinessKnowledge = (site: WidgetSite): BusinessKnowledge => ({
  name: site.name,
  description: site.chatBot?.description || `el sitio web ${site.name}`,
  addressing: isAddressing(site.chatBot?.addressing) ? site.chatBot.addressing : "vos",
  contact: site.chatBot?.contact || DEFAULT_CONTACT,
  faqs: site.helpdesk,
});

/** Fixed answer once the site reaches its daily cap: no model call, just the way to reach the business. */
export const siteCapReply = (site: WidgetSite) =>
  `En este momento no puedo responder más consultas. Podés comunicarte con el negocio por ${toBusinessKnowledge(site).contact}.`;

/** Marks the site's bot as installed the first time the widget loads from the site itself. */
export const markInstalled = (db: PrismaClient, domainId: string) =>
  db.chatBot.updateMany({ where: { domainId, installedAt: null }, data: { installedAt: new Date() } });

/** Plain HTTP origins are only accepted outside production, or in E2E runs. */
export const allowHttpOrigins = () =>
  process.env.NODE_ENV !== "production" || process.env.WIDGET_ALLOW_HTTP === "true";
