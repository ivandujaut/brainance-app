"use server";
import { captureRate, dayKey, derivationRate, fillDays, medianMinutes, TIME_ZONE } from "@/domain/metrics";
import { Prisma } from "@/generated/prisma/client";
import { client } from "@/lib/prisma";
import { currentOwnerId, findOwnedSite } from "@/server/tenancy";

// The owner's dashboard metrics (spec 007). Every query is scoped to the signed-in owner (ADR 0004).

export type MetricsPeriod = 7 | 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export const onGetOwnerMetrics = async ({ siteId, days }: { siteId?: string; days: MetricsPeriod }) => {
  const owner = await currentOwnerId();
  if (!owner) return null;
  let domainId: string | null = null;
  if (siteId !== undefined) {
    const site = await findOwnedSite(siteId);
    if (!site) return null;
    domainId = site.id;
  }
  const period = days === 30 ? 30 : 7;
  const today = dayKey(new Date());
  // From the start of the first calendar day of the period, in Argentina.
  const since = new Date(Date.now() - (period - 1) * DAY_MS - DAY_MS);
  const scope = Prisma.sql`u."clerkId" = ${owner} AND (${domainId}::uuid IS NULL OR d.id = ${domainId}::uuid)`;
  const day = (column: Prisma.Sql) =>
    Prisma.sql`to_char((${column} AT TIME ZONE 'UTC') AT TIME ZONE ${TIME_ZONE}, 'YYYY-MM-DD')`;
  const firstDay = fillDays([], { days: period, today })[0].day;

  const [rooms, leads, answers, responses] = await Promise.all([
    client.$queryRaw<{ day: string; room: string; answered: boolean; attention: boolean; humanRequest: boolean }[]>`
      SELECT ${day(Prisma.sql`min(m."createdAt") FILTER (WHERE m.role = 'user')`)} AS day,
             r.id AS room,
             bool_or(m.role = 'assistant') AS answered,
             (r."attentionReason" IS NOT NULL) AS attention,
             (r."attentionReason" = 'human_request') AS "humanRequest"
      FROM "ChatMessage" m
      JOIN "ChatRoom" r ON r.id = m."chatRoomId"
      JOIN "Customer" c ON c.id = r."customerId"
      JOIN "Domain" d ON d.id = c."domainId"
      JOIN "User" u ON u.id = d."userId"
      WHERE ${scope} AND m."createdAt" >= ${since}
      GROUP BY r.id
      HAVING bool_or(m.role = 'user')`,
    client.$queryRaw<{ day: string }[]>`
      SELECT ${day(Prisma.sql`c."leadAt"`)} AS day
      FROM "Customer" c
      JOIN "Domain" d ON d.id = c."domainId"
      JOIN "User" u ON u.id = d."userId"
      WHERE ${scope} AND c."leadAt" >= ${since}`,
    // Spec 011, criteria 1, 2 and 4: the bot's answers (never a person's) and how many derived.
    client.$queryRaw<{ day: string; derived: boolean }[]>`
      SELECT ${day(Prisma.sql`m."createdAt"`)} AS day, m.derivation AS derived
      FROM "ChatMessage" m
      JOIN "ChatRoom" r ON r.id = m."chatRoomId"
      JOIN "Customer" c ON c.id = r."customerId"
      JOIN "Domain" d ON d.id = c."domainId"
      JOIN "User" u ON u.id = d."userId"
      WHERE ${scope} AND m.role = 'assistant' AND m."createdAt" >= ${since}`,
    // Spec 011, criterion 3: minutes from each flag to the owner's first message after it, stamped
    // on that message by ownerReply so a later episode in the same room does not erase it.
    client.$queryRaw<{ day: string; minutes: number }[]>`
      SELECT ${day(Prisma.sql`m."answersAttentionAt"`)} AS day,
             extract(epoch FROM (m."createdAt" - m."answersAttentionAt")) / 60 AS minutes
      FROM "ChatMessage" m
      JOIN "ChatRoom" r ON r.id = m."chatRoomId"
      JOIN "Customer" c ON c.id = r."customerId"
      JOIN "Domain" d ON d.id = c."domainId"
      JOIN "User" u ON u.id = d."userId"
      WHERE ${scope} AND m.role = 'owner' AND m."answersAttentionAt" >= ${since}`,
  ]);

  // Keep only the calendar days of the period (the query window starts a day early for time zones).
  const inPeriod = <T extends { day: string }>(rows: T[]) => rows.filter((r) => r.day >= firstDay && r.day <= today);
  const periodRooms = inPeriod(rooms);
  const periodLeads = inPeriod(leads);
  const answeredConversations = periodRooms.filter((r) => r.answered).length;
  const periodAnswers = inPeriod(answers);
  const derived = periodAnswers.filter((a) => a.derived).length;
  const responseMinutes = inPeriod(responses).map((r) => Number(r.minutes));
  const median = medianMinutes(responseMinutes);

  const perDay = new Map<string, { day: string; conversations: number; leads: number }>();
  const bucket = (d: string) => perDay.get(d) ?? perDay.set(d, { day: d, conversations: 0, leads: 0 }).get(d)!;
  for (const r of periodRooms) bucket(r.day).conversations++;
  for (const l of periodLeads) bucket(l.day).leads++;

  return {
    days: period,
    conversations: periodRooms.length,
    answeredConversations,
    leads: periodLeads.length,
    captureRate: captureRate({ leads: periodLeads.length, answeredConversations }),
    needingAttention: periodRooms.filter((r) => r.attention).length,
    // Spec 011: honesty metrics.
    answers: periodAnswers.length,
    derived,
    derivationRate: derivationRate({ answers: periodAnswers.length, derived }),
    humanRequests: periodRooms.filter((r) => r.humanRequest).length,
    responseTime: median === null ? null : { medianMinutes: median, cases: responseMinutes.length },
    series: fillDays([...perDay.values()], { days: period, today }),
  };
};

export type OwnerMetrics = NonNullable<Awaited<ReturnType<typeof onGetOwnerMetrics>>>;
