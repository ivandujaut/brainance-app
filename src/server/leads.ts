import { buildLeadEmail } from "@/domain/lead-email";
import {
  canSubmitLead,
  LEAD_LIMITS,
  LeadFormSchema,
  resolveAnswers,
  shouldNotifyOwner,
  type LeadResponse,
} from "@/domain/leads";
import type { PrismaClient } from "@/generated/prisma/client";
import { createOrRead } from "./db-utils";
import type { EmailSender } from "./email";

// Lead capture from the public widget (spec 005). The visitor is identified by their secret
// visitorId (ADR 0003); every question id is checked against the site's own questions.

export type LeadNotice = { ownerClerkId: string; siteName: string; email: string; responses: LeadResponse[] };

export type SaveLeadResult =
  | { ok: true; email: string; notice: LeadNotice | null }
  | { ok: false; status: 400 | 404 | 429; message: string };

const NOT_AVAILABLE = { ok: false, status: 404, message: "No podemos guardar tus datos en este sitio." } as const;

export const saveLead = async (
  db: PrismaClient,
  { domainId, visitorId, input }: { domainId: string; visitorId: string; input: unknown },
): Promise<SaveLeadResult> => {
  const parsed = LeadFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, status: 400, message: parsed.error.issues[0]?.message ?? "Revisá tus datos." };

  const site = await db.domain.findUnique({
    where: { id: domainId },
    select: {
      name: true,
      User: { select: { clerkId: true } },
      chatBot: { select: { leadCapture: true, leadEmail: true } },
      filterQuestions: { select: { id: true, question: true } },
    },
  });
  if (!site?.User || site.chatBot?.leadCapture === false) return NOT_AVAILABLE;

  const answers = resolveAnswers(parsed.data.answers, site.filterQuestions);
  if (!answers.ok) return { ok: false, status: 400, message: "Alguna de las preguntas ya no existe. Recargá el chat." };

  const where = { domainId_visitorId: { domainId, visitorId } };
  const { id: customerId } = await createOrRead(
    () => db.customer.upsert({ where, update: {}, create: { domainId, visitorId }, select: { id: true } }),
    () => db.customer.findUniqueOrThrow({ where, select: { id: true } }),
  );

  return db.$transaction(async (tx) => {
    // Serializes a visitor's submissions, so a double click cannot email the owner twice.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${customerId}))`;
    const now = Date.now();
    const [recent, siteEmailsToday, current] = await Promise.all([
      tx.leadSubmission.count({
        where: { customerId, createdAt: { gte: new Date(now - LEAD_LIMITS.visitor.windowMs) } },
      }),
      tx.leadSubmission.count({
        where: {
          notified: true,
          createdAt: { gte: new Date(now - LEAD_LIMITS.siteEmails.windowMs) },
          customer: { domainId },
        },
      }),
      tx.customer.findUniqueOrThrow({ where: { id: customerId }, select: { leadAt: true } }),
    ]);
    if (!canSubmitLead(recent)) {
      return { ok: false, status: 429, message: "Enviaste tus datos varias veces seguidas. Esperá unos minutos." } as const;
    }

    const notify = shouldNotifyOwner({
      firstSubmission: !current.leadAt,
      emailEnabled: site.chatBot?.leadEmail !== false,
      siteEmailsToday,
    });
    const { email } = parsed.data;
    await tx.customer.update({
      where: { id: customerId },
      data: { email, leadAt: current.leadAt ?? new Date(now), consentAt: new Date(now) },
    });
    await tx.customerResponses.deleteMany({ where: { customerId } });
    if (answers.responses.length) {
      await tx.customerResponses.createMany({ data: answers.responses.map((r) => ({ customerId, ...r })) });
    }
    await tx.leadSubmission.create({ data: { customerId, notified: notify } });

    const notice = notify
      ? { ownerClerkId: site.User!.clerkId, siteName: site.name, email, responses: answers.responses }
      : null;
    return { ok: true, email, notice } as const;
  });
};

/** Whether this visitor already left their data on this site. */
export const leadCaptured = async (db: PrismaClient, domainId: string, visitorId: string) =>
  (await db.customer.count({ where: { domainId, visitorId, leadAt: { not: null } } })) > 0;

type NoticeDeps = { sender: EmailSender; ownerEmail: (clerkId: string) => Promise<string | null>; appUrl: string };

/** Emails the owner about a new lead. Never throws: the lead is already stored (criterion 11). */
export const sendLeadNotice = async (notice: LeadNotice, { sender, ownerEmail, appUrl }: NoticeDeps) => {
  try {
    const to = await ownerEmail(notice.ownerClerkId);
    if (!to) throw new Error(`Owner ${notice.ownerClerkId} has no email address`);
    const email = buildLeadEmail({ ...notice, leadsUrl: `${appUrl}/leads` });
    await sender.send({ to, ...email });
    return true;
  } catch (error) {
    console.error("Lead notice failed", error);
    return false;
  }
};
