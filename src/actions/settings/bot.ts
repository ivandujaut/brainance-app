"use server";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { DailyAnswerCapSchema, effectiveAnswerCap, usageState } from "@/domain/answer-cap";
import { SITE_DAILY_LIMIT } from "@/domain/widget-limits";
import {
  AppearanceSchema,
  BusinessInfoSchema,
  canAddFaq,
  FaqSchema,
  FilterQuestionSchema,
  LeadSettingsSchema,
  MAX_FAQS,
} from "@/domain/bot-settings";
import { client } from "@/lib/prisma";
import { countSiteAnswersSince } from "@/server/conversations";
import { findOwnedFaq, findOwnedFilterQuestion, findOwnedSite } from "@/server/tenancy";
import { captureError } from "@/server/observability";

// Bot settings (spec 004). Every id is resolved through src/server/tenancy.ts (ADR 0004) and every
// input is validated with the schemas the forms use (src/domain/bot-settings.ts).

export type ActionResult = { status: 200 | 400 | 404 | 500; message: string };

const NOT_FOUND: ActionResult = { status: 404, message: "No encontramos ese sitio." };
const QUESTION_NOT_FOUND: ActionResult = { status: 404, message: "No encontramos esa pregunta." };
const FAILED: ActionResult = { status: 500, message: "No pudimos guardar los cambios. Probá de nuevo." };

const firstError = (error: z.ZodError): ActionResult => ({
  status: 400,
  message: error.issues[0]?.message ?? "Revisá los datos.",
});

const refresh = (siteId: string | null) => {
  if (siteId) revalidatePath(`/settings/${siteId}`);
};

const attempt = async (siteId: string | null, write: () => Promise<unknown>, message: string): Promise<ActionResult> => {
  try {
    await write();
    refresh(siteId);
    return { status: 200, message };
  } catch (error) {
    captureError(error, { area: "settings", domainId: siteId ?? undefined });
    return FAILED;
  }
};

/** Everything the settings page shows for one of the owner's sites, or null. */
export const onGetSiteSettings = async (id: string) => {
  const site = await findOwnedSite(id);
  if (!site) return null;
  return client.domain.findUnique({
    where: { id: site.id },
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
          installedAt: true,
          leadCapture: true,
          leadEmail: true,
          attentionEmail: true,
          dailyAnswerCap: true,
        },
      },
      helpdesk: { select: { id: true, question: true, answer: true }, orderBy: { question: "asc" } },
      filterQuestions: { select: { id: true, question: true }, orderBy: { question: "asc" } },
    },
  });
};

export type SiteSettings = NonNullable<Awaited<ReturnType<typeof onGetSiteSettings>>>;

const saveBot = (domainId: string, data: Record<string, unknown>) =>
  client.chatBot.upsert({ where: { domainId }, create: { domainId, ...data }, update: data });

export const onUpdateBusinessInfo = async (id: string, input: unknown) => {
  const site = await findOwnedSite(id);
  if (!site) return NOT_FOUND;
  const parsed = BusinessInfoSchema.safeParse(input);
  if (!parsed.success) return firstError(parsed.error);
  return attempt(site.id, () => saveBot(site.id, parsed.data), "Datos del negocio guardados");
};

export const onUpdateAppearance = async (id: string, input: unknown) => {
  const site = await findOwnedSite(id);
  if (!site) return NOT_FOUND;
  const parsed = AppearanceSchema.safeParse(input);
  if (!parsed.success) return firstError(parsed.error);
  return attempt(site.id, () => saveBot(site.id, parsed.data), "Apariencia guardada");
};

export const onUpdateLeadSettings = async (id: string, input: unknown) => {
  const site = await findOwnedSite(id);
  if (!site) return NOT_FOUND;
  const parsed = LeadSettingsSchema.safeParse(input);
  if (!parsed.success) return firstError(parsed.error);
  return attempt(site.id, () => saveBot(site.id, parsed.data), "Avisos guardados");
};

/** Spec 011, criteria 8 and 14: the owner's daily answer cap; blank means the beta maximum. */
export const onUpdateDailyAnswerCap = async (id: string, input: unknown) => {
  const site = await findOwnedSite(id);
  if (!site) return NOT_FOUND;
  const parsed = DailyAnswerCapSchema.safeParse(input);
  if (!parsed.success) return firstError(parsed.error);
  return attempt(site.id, () => saveBot(site.id, parsed.data), "Tope guardado");
};

export type SiteUsage = { answersToday: number; cap: number; remaining: number; ratio: number; reached: boolean };

/**
 * Spec 011, criteria 7, 11 and 12: today's bot answers against the cap in force. The same count
 * the widget endpoint checks before calling the model, so the panel and the cap never disagree.
 */
export const onGetSiteUsage = async (id: string): Promise<SiteUsage | null> => {
  const site = await findOwnedSite(id);
  if (!site) return null;
  const [bot, answersToday] = await Promise.all([
    client.chatBot.findUnique({ where: { domainId: site.id }, select: { dailyAnswerCap: true } }),
    countSiteAnswersSince(client, site.id, new Date(Date.now() - SITE_DAILY_LIMIT.windowMs)),
  ]);
  const cap = effectiveAnswerCap(bot?.dailyAnswerCap);
  return { answersToday, cap, ...usageState({ answersToday, cap }) };
};

export const onCreateHelpDeskQuestion = async (id: string, input: unknown) => {
  const site = await findOwnedSite(id);
  if (!site) return NOT_FOUND;
  const parsed = FaqSchema.safeParse(input);
  if (!parsed.success) return firstError(parsed.error);
  if (!canAddFaq(await client.helpDesk.count({ where: { domainId: site.id } }))) {
    return { status: 400, message: `Podés cargar hasta ${MAX_FAQS} preguntas frecuentes por sitio.` } satisfies ActionResult;
  }
  return attempt(site.id, () => client.helpDesk.create({ data: { domainId: site.id, ...parsed.data } }), "Pregunta agregada");
};

export const onUpdateHelpDeskQuestion = async (id: string, input: unknown) => {
  const faq = await findOwnedFaq(id);
  if (!faq) return QUESTION_NOT_FOUND;
  const parsed = FaqSchema.safeParse(input);
  if (!parsed.success) return firstError(parsed.error);
  return attempt(faq.domainId, () => client.helpDesk.update({ where: { id: faq.id }, data: parsed.data }), "Pregunta actualizada");
};

export const onDeleteHelpDeskQuestion = async (id: string) => {
  const faq = await findOwnedFaq(id);
  if (!faq) return QUESTION_NOT_FOUND;
  return attempt(faq.domainId, () => client.helpDesk.delete({ where: { id: faq.id } }), "Pregunta borrada");
};

export const onCreateFilterQuestion = async (id: string, input: unknown) => {
  const site = await findOwnedSite(id);
  if (!site) return NOT_FOUND;
  const parsed = FilterQuestionSchema.safeParse(input);
  if (!parsed.success) return firstError(parsed.error);
  return attempt(
    site.id,
    () => client.filterQuestions.create({ data: { domainId: site.id, ...parsed.data } }),
    "Pregunta agregada",
  );
};

export const onDeleteFilterQuestion = async (id: string) => {
  const question = await findOwnedFilterQuestion(id);
  if (!question) return QUESTION_NOT_FOUND;
  return attempt(question.domainId, () => client.filterQuestions.delete({ where: { id: question.id } }), "Pregunta borrada");
};
