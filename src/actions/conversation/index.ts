"use server";
import { client } from "@/lib/prisma";
import { listMessages } from "@/server/conversations";
import { OWNER_MESSAGE_MAX, ownerReply, releaseToBot, takeOver } from "@/server/live";
import { notifyRoomChanged, ownerChannel, publicRealtimeConfig } from "@/server/realtime";
import { currentOwnerId, findOwnedChatRoom, findOwnedSite } from "@/server/tenancy";

// The owner's inbox (spec 006). Every id is resolved through src/server/tenancy.ts (ADR 0004).

export type InboxFilter = "all" | "unread" | "attention";

/** Enough for the beta; paginate when an owner gets close. */
const MAX_CONVERSATIONS = 200;
const UNREAD = { seen: false, role: "user" as const };

export const onListConversations = async ({ siteId, filter = "all" }: { siteId?: string; filter?: InboxFilter }) => {
  const owner = await currentOwnerId();
  if (!owner) return [];
  let domainId: string | undefined;
  if (siteId !== undefined) {
    const site = await findOwnedSite(siteId);
    if (!site) return [];
    domainId = site.id;
  }
  const rooms = await client.chatRoom.findMany({
    where: {
      lastMessageAt: { not: null },
      Customer: { Domain: { User: { clerkId: owner } }, ...(domainId && { domainId }) },
      ...(filter === "unread" && { message: { some: UNREAD } }),
      ...(filter === "attention" && { needsAttention: true }),
    },
    orderBy: { lastMessageAt: "desc" },
    take: MAX_CONVERSATIONS,
    select: {
      id: true,
      lastMessageAt: true,
      liveSince: true,
      needsAttention: true,
      attentionReason: true,
      Customer: { select: { email: true, leadAt: true, Domain: { select: { name: true } } } },
      message: {
        where: { role: { not: "system" } },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { message: true },
      },
      _count: { select: { message: { where: UNREAD } } },
    },
  });
  return rooms.map((room) => ({
    id: room.id,
    site: room.Customer?.Domain?.name ?? "",
    visitor: room.Customer?.leadAt && room.Customer.email ? room.Customer.email : "Visitante",
    lastMessage: room.message[0]?.message ?? "",
    lastMessageAt: room.lastMessageAt!,
    unread: room._count.message,
    live: Boolean(room.liveSince),
    needsAttention: room.needsAttention,
    attentionReason: room.attentionReason,
  }));
};

export type ConversationSummary = Awaited<ReturnType<typeof onListConversations>>[number];

/** A conversation with its messages (only those after `after`, for polling), or null. */
export const onGetConversation = async (id: string, after?: string) => {
  const owned = await findOwnedChatRoom(id);
  if (!owned) return null;
  const [room, messages] = await Promise.all([
    client.chatRoom.findUniqueOrThrow({
      where: { id: owned.id },
      select: {
        liveSince: true,
        needsAttention: true,
        attentionReason: true,
        Customer: {
          select: {
            email: true,
            leadAt: true,
            Domain: { select: { name: true } },
            questions: { select: { question: true, answered: true } },
          },
        },
      },
    }),
    listMessages(client, owned.id, 200, after),
  ]);
  const customer = room.Customer;
  return {
    id: owned.id,
    site: customer?.Domain?.name ?? "",
    live: Boolean(room.liveSince),
    needsAttention: room.needsAttention,
    attentionReason: room.attentionReason,
    lead:
      customer?.leadAt && customer.email
        ? { email: customer.email, responses: customer.questions.map((q) => ({ question: q.question, answered: q.answered ?? "" })) }
        : null,
    messages: messages.map(({ id: messageId, role, content, createdAt }) => ({ id: messageId, role, content, createdAt })),
  };
};

export type Conversation = NonNullable<Awaited<ReturnType<typeof onGetConversation>>>;

export const onMarkRead = async (id: string) => {
  const room = await findOwnedChatRoom(id);
  if (!room) return;
  await client.chatMessage.updateMany({ where: { chatRoomId: room.id, seen: false }, data: { seen: true } });
};

const NOT_FOUND = { status: 404, message: "No encontramos esa conversación." } as const;

const siteName = async (roomId: string) =>
  (
    await client.chatRoom.findUniqueOrThrow({
      where: { id: roomId },
      select: { Customer: { select: { Domain: { select: { name: true } } } } },
    })
  ).Customer?.Domain?.name ?? "el negocio";

export const onTakeOver = async (id: string) => {
  const room = await findOwnedChatRoom(id);
  if (!room) return NOT_FOUND;
  await takeOver(client, room.id, await siteName(room.id));
  await notifyRoomChanged(client, room.id);
  return { status: 200, message: "Tomaste el control: el bot no responde en esta conversación." } as const;
};

export const onReleaseToBot = async (id: string) => {
  const room = await findOwnedChatRoom(id);
  if (!room) return NOT_FOUND;
  await releaseToBot(client, room.id);
  await notifyRoomChanged(client, room.id);
  return { status: 200, message: "El bot vuelve a responder esta conversación." } as const;
};

export const onOwnerReply = async (id: string, text: string) => {
  const room = await findOwnedChatRoom(id);
  if (!room) return NOT_FOUND;
  const reply = await ownerReply(client, room.id, String(text ?? ""), await siteName(room.id));
  if (!reply) return { status: 400, message: `Escribí un mensaje de hasta ${OWNER_MESSAGE_MAX} caracteres.` } as const;
  await notifyRoomChanged(client, room.id);
  return { status: 200, message: "Mensaje enviado", id: reply.id } as const;
};

/** Push settings for the owner's inbox; without Pusher keys the inbox runs on polling (ADR 0007). */
export const onGetInboxRealtime = async () => {
  const owner = await currentOwnerId();
  const config = publicRealtimeConfig();
  if (!owner || !config) return null;
  const user = await client.user.findUnique({ where: { clerkId: owner }, select: { id: true } });
  return user ? { config, channel: ownerChannel(user.id) } : null;
};
