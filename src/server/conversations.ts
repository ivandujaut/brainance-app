import type { StoredRole } from "@/domain/takeover";
import type { PrismaClient } from "@/generated/prisma/client";
import { createOrRead } from "./db-utils";

export type WidgetRole = StoredRole;

/**
 * The visitor's conversation on a site, created on first use. Safe under concurrent calls:
 * the customer is unique per (site, visitor) and room creation is serialized per customer.
 */
export const getOrCreateRoom = async (
  db: PrismaClient,
  { domainId, visitorId }: { domainId: string; visitorId: string },
): Promise<string> => {
  const where = { domainId_visitorId: { domainId, visitorId } };
  const customer = await createOrRead(
    () => db.customer.upsert({ where, update: {}, create: { domainId, visitorId } }),
    () => db.customer.findUniqueOrThrow({ where }),
  );

  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${customer.id}))`;
    const existing = await tx.chatRoom.findFirst({
      where: { customerId: customer.id },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (existing) return existing.id;
    const room = await tx.chatRoom.create({ data: { customerId: customer.id }, select: { id: true } });
    return room.id;
  });
};

/** Stores a message and moves the conversation to the top of the owner's inbox. */
export const addMessage = async (db: PrismaClient, chatRoomId: string, role: WidgetRole, content: string) => {
  const [message] = await db.$transaction([
    db.chatMessage.create({ data: { chatRoomId, role, message: content }, select: { id: true, createdAt: true } }),
    db.chatRoom.update({ where: { id: chatRoomId }, data: { lastMessageAt: new Date() } }),
  ]);
  return message.id;
};

/**
 * The conversation in chronological order (at most the last `limit` messages). With `after`, only
 * messages since that one: clients poll with the last id they have and merge by id (ADR 0007).
 */
export const listMessages = async (db: PrismaClient, chatRoomId: string, limit = 50, after?: string) => {
  const cursor = after
    ? await db.chatMessage.findFirst({ where: { id: after, chatRoomId }, select: { id: true, createdAt: true } })
    : null;
  const rows = await db.chatMessage.findMany({
    where: {
      chatRoomId,
      role: { not: null },
      ...(cursor && { createdAt: { gte: cursor.createdAt }, id: { not: cursor.id } }),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    select: { id: true, role: true, message: true, createdAt: true },
  });
  return rows.reverse().map((m) => ({ id: m.id, role: m.role as WidgetRole, content: m.message, createdAt: m.createdAt }));
};

export const countVisitorMessagesSince = (db: PrismaClient, chatRoomId: string, since: Date) =>
  db.chatMessage.count({ where: { chatRoomId, role: "user", createdAt: { gte: since } } });

export const countSiteMessagesSince = (db: PrismaClient, domainId: string, since: Date) =>
  db.chatMessage.count({
    where: { role: "user", createdAt: { gte: since }, ChatRoom: { Customer: { domainId } } },
  });
