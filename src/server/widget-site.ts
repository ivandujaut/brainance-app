import type { BusinessKnowledge } from "@/domain/answer-prompt";
import type { PrismaClient } from "@/generated/prisma/client";

// Until bot settings (roadmap item 3) store a contact channel, the bot points to the site itself.
export const DEFAULT_CONTACT = "los canales de contacto que figuran en este sitio";

export const WIDGET_DEFAULTS = { background: "#FFA947", textColor: "#FFFFFF" };

/** Public data the widget needs about a site, or null if it does not exist. */
export const getWidgetSite = (db: PrismaClient, domainId: string) =>
  db.domain.findUnique({
    where: { id: domainId },
    select: {
      id: true,
      name: true,
      chatBot: { select: { welcomeMessage: true, icon: true, background: true, textColor: true } },
      helpdesk: { select: { question: true, answer: true } },
    },
  });

export type WidgetSite = NonNullable<Awaited<ReturnType<typeof getWidgetSite>>>;

/** What the visitor's browser may see: no FAQs, no ids beyond the site's own. */
export const toPublicConfig = (site: WidgetSite) => ({
  name: site.name,
  welcomeMessage: site.chatBot?.welcomeMessage || "¡Hola! ¿En qué te puedo ayudar?",
  icon: site.chatBot?.icon || null,
  background: site.chatBot?.background || WIDGET_DEFAULTS.background,
  textColor: site.chatBot?.textColor || WIDGET_DEFAULTS.textColor,
});

export const toBusinessKnowledge = (site: WidgetSite): BusinessKnowledge => ({
  name: site.name,
  description: `el sitio web ${site.name}`,
  addressing: "vos",
  contact: DEFAULT_CONTACT,
  faqs: site.helpdesk,
});

/** Marks the site's bot as installed the first time the widget loads from the site itself. */
export const markInstalled = (db: PrismaClient, domainId: string) =>
  db.chatBot.updateMany({ where: { domainId, installedAt: null }, data: { installedAt: new Date() } });

/** Plain HTTP origins are only accepted outside production, or in E2E runs. */
export const allowHttpOrigins = () =>
  process.env.NODE_ENV !== "production" || process.env.WIDGET_ALLOW_HTTP === "true";
