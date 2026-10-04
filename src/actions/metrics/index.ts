"use server";
import { captureRate, dayKey, fillDays, TIME_ZONE } from "@/domain/metrics";
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

  const [rooms, leads] = await Promise.all([
    client.$queryRaw<{ day: string; room: string; answered: boolean; attention: boolean }[]>`
      SELECT ${day(Prisma.sql`min(m."createdAt") FILTER (WHERE m.role = 'user')`)} AS day,
             r.id AS room,
             bool_or(m.role = 'assistant') AS answered,
             (r."attentionReason" IS NOT NULL) AS attention
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
  ]);

  // Keep only the calendar days of the period (the query window starts a day early for time zones).
  const inPeriod = <T extends { day: string }>(rows: T[]) => rows.filter((r) => r.day >= firstDay && r.day <= today);
  const periodRooms = inPeriod(rooms);
  const periodLeads = inPeriod(leads);
  const answeredConversations = periodRooms.filter((r) => r.answered).length;

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
    series: fillDays([...perDay.values()], { days: period, today }),
  };
};

export type OwnerMetrics = NonNullable<Awaited<ReturnType<typeof onGetOwnerMetrics>>>;
