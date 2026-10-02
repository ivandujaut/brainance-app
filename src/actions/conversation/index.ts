"use server";
import { client } from "@/lib/prisma";
import { findOwnedChatRoom, findOwnedSite } from "@/server/tenancy";

// Every action resolves its id through src/server/tenancy.ts: ids from the browser are only
// trusted after checking they belong to the signed-in owner (ADR 0004).

export const onToggleRealtime = async (id: string, state: boolean) => {
  const room = await findOwnedChatRoom(id);
  if (!room) return;
  try {
    const chatRoom = await client.chatRoom.update({
      where: { id: room.id },
      data: { live: state },
      select: { id: true, live: true },
    });
    return {
      status: 200,
      message: chatRoom.live ? "Tomaste el control de la conversación" : "El bot vuelve a responder",
      chatRoom,
    };
  } catch (error) {
    console.error(error);
  }
};

export const onGetConversationMode = async (id: string) => {
  const room = await findOwnedChatRoom(id);
  if (!room) return null;
  return client.chatRoom.findUnique({ where: { id: room.id }, select: { live: true } });
};

export const onGetDomainChatRooms = async (id: string) => {
  const site = await findOwnedSite(id);
  if (!site) return;
  try {
    return await client.domain.findUnique({
      where: { id: site.id },
      select: {
        customer: {
          select: {
            email: true,
            chatRoom: {
              select: {
                createdAt: true,
                id: true,
                message: {
                  select: { message: true, createdAt: true, seen: true },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

export const onGetChatMessages = async (id: string) => {
  const room = await findOwnedChatRoom(id);
  if (!room) return;
  try {
    return await client.chatRoom.findMany({
      where: { id: room.id },
      select: {
        id: true,
        live: true,
        message: {
          select: { id: true, role: true, message: true, createdAt: true, seen: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

export const onViewUnReadMessages = async (id: string) => {
  const room = await findOwnedChatRoom(id);
  if (!room) return;
  try {
    await client.chatMessage.updateMany({ where: { chatRoomId: room.id }, data: { seen: true } });
  } catch (error) {
    console.error(error);
  }
};

export const onOwnerSendMessage = async (chatroom: string, message: string, role: "assistant" | "user") => {
  const room = await findOwnedChatRoom(chatroom);
  if (!room) return;
  try {
    return await client.chatRoom.update({
      where: { id: room.id },
      data: { message: { create: { message, role } } },
      select: {
        message: {
          select: { id: true, role: true, message: true, createdAt: true, seen: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};
