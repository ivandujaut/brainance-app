"use server";
import { revalidatePath } from "next/cache";
import { leadsToCsv } from "@/domain/leads-csv";
import { client } from "@/lib/prisma";
import { currentOwnerId, findOwnedLead, findOwnedSite } from "@/server/tenancy";
import { captureError } from "@/server/observability";

// Leads of the signed-in owner (spec 005). Ids are resolved through src/server/tenancy.ts (ADR 0004).

/** Enough for the beta; paginate when an owner gets close. */
const MAX_LEADS = 1000;

/** The owner's leads, newest first; only those of `siteId` when given (an unknown site lists nothing). */
export const onListLeads = async (siteId?: string) => {
  const owner = await currentOwnerId();
  if (!owner) return [];
  let domainId: string | undefined;
  if (siteId !== undefined) {
    const site = await findOwnedSite(siteId);
    if (!site) return [];
    domainId = site.id;
  }
  const rows = await client.customer.findMany({
    where: { leadAt: { not: null }, email: { not: null }, Domain: { User: { clerkId: owner } }, ...(domainId && { domainId }) },
    orderBy: { leadAt: "desc" },
    take: MAX_LEADS,
    select: {
      id: true,
      email: true,
      leadAt: true,
      Domain: { select: { name: true } },
      questions: { select: { question: true, answered: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    email: row.email!,
    site: row.Domain?.name ?? "",
    createdAt: row.leadAt!,
    responses: row.questions.map((q) => ({ question: q.question, answered: q.answered ?? "" })),
  }));
};

export type Lead = Awaited<ReturnType<typeof onListLeads>>[number];

export const onExportLeads = async (siteId?: string) => leadsToCsv(await onListLeads(siteId));

/** Erases the lead's personal data; the conversation stays, anonymous (criterion 14). */
export const onDeleteLead = async (id: string) => {
  const lead = await findOwnedLead(id);
  if (!lead) return { status: 404, message: "No encontramos ese lead." };
  try {
    await client.$transaction([
      client.customerResponses.deleteMany({ where: { customerId: lead.id } }),
      client.customer.update({ where: { id: lead.id }, data: { email: null, leadAt: null, consentAt: null } }),
    ]);
    revalidatePath("/leads");
    return { status: 200, message: "Borraste los datos del lead" };
  } catch (error) {
    captureError(error, { area: "leads", domainId: lead.domainId ?? undefined });
    return { status: 500, message: "No pudimos borrar el lead. Probá de nuevo." };
  }
};

/** The owner's sites, for the filter of the leads page. */
export const onListLeadSites = async () => {
  const owner = await currentOwnerId();
  if (!owner) return [];
  return client.domain.findMany({
    where: { User: { clerkId: owner } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
};
