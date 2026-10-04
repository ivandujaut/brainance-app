import type { AttentionReason } from "@/domain/attention";
import { decideVisitorTurn } from "@/domain/takeover";
import type { PrismaClient } from "@/generated/prisma/client";
import { addMessage } from "./conversations";

// Human takeover of a conversation (spec 006). Callers resolve the room id through tenancy.ts
// (owner side) or the visitorId (widget side) before calling these.

export const OWNER_MESSAGE_MAX = 2000;
export const takeOverNotice = (businessName: string) => `Ahora te atiende una persona de ${businessName}.`;
export const RELEASE_NOTICE = "Te vuelve a atender el asistente virtual.";

type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

/** Serializes state changes of one conversation, so concurrent clicks add a single notice. */
const withRoomLock = <T>(db: PrismaClient, roomId: string, work: (tx: Tx) => Promise<T>) =>
  db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`room:${roomId}`}))`;
    return work(tx);
  });

const notice = (tx: Tx, chatRoomId: string, text: string, at: Date) =>
  tx.chatMessage.create({ data: { chatRoomId, role: "system", message: text, createdAt: at, seen: true } });

/** The owner takes the conversation: the bot stops answering. Returns whether it changed. */
export const takeOver = (db: PrismaClient, roomId: string, businessName: string) =>
  withRoomLock(db, roomId, async (tx) => {
    const room = await tx.chatRoom.findUniqueOrThrow({ where: { id: roomId }, select: { liveSince: true } });
    if (room.liveSince) return false;
    const now = new Date();
    await tx.chatRoom.update({
      where: { id: roomId },
      data: { liveSince: now, live: true, needsAttention: false, attentionReason: null, lastMessageAt: now },
    });
    await notice(tx, roomId, takeOverNotice(businessName), now);
    return true;
  });

/** The bot answers again. Returns whether it changed. */
export const releaseToBot = (db: PrismaClient, roomId: string) =>
  withRoomLock(db, roomId, async (tx) => {
    const room = await tx.chatRoom.findUniqueOrThrow({ where: { id: roomId }, select: { liveSince: true } });
    if (!room.liveSince) return false;
    const now = new Date();
    await tx.chatRoom.update({ where: { id: roomId }, data: { liveSince: null, live: false, lastMessageAt: now } });
    await notice(tx, roomId, RELEASE_NOTICE, now);
    return true;
  });

/** Stores the owner's reply, taking over first if the bot had the conversation. Null if invalid. */
export const ownerReply = async (db: PrismaClient, roomId: string, raw: string, businessName: string) => {
  const text = raw.trim();
  if (!text || text.length > OWNER_MESSAGE_MAX) return null;
  await takeOver(db, roomId, businessName);
  await db.chatRoom.update({ where: { id: roomId }, data: { needsAttention: false, attentionReason: null } });
  return { id: await addMessage(db, roomId, "owner", text) };
};

/**
 * Who handles a new visitor message. If the owner stopped writing more than 30 minutes ago, the
 * conversation goes back to the bot (with its notice) and the bot answers this message.
 */
export const resolveVisitorTurn = async (db: PrismaClient, roomId: string, now = new Date()) => {
  const [room, lastOwner] = await Promise.all([
    db.chatRoom.findUniqueOrThrow({ where: { id: roomId }, select: { liveSince: true } }),
    db.chatMessage.findFirst({
      where: { chatRoomId: roomId, role: "owner" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);
  const turn = decideVisitorTurn({ liveSince: room.liveSince, lastOwnerMessageAt: lastOwner?.createdAt ?? null, now });
  if (turn === "release") {
    await releaseToBot(db, roomId);
    return "bot" as const;
  }
  return turn;
};

export const flagAttention = (db: PrismaClient, roomId: string, reason: AttentionReason) =>
  db.chatRoom.update({ where: { id: roomId }, data: { needsAttention: true, attentionReason: reason } });
