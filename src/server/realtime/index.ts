import Pusher from "pusher";
import { isVisitorId } from "@/domain/widget-limits";
import type { PrismaClient } from "@/generated/prisma/client";

// Push as a hint, polling as the fallback (ADR 0007). Events carry no content: clients fetch what
// changed through the endpoints that already check access.

export interface Realtime {
  enabled: boolean;
  publish(channels: string[]): Promise<void>;
  authorize(socketId: string, channel: string): { auth: string };
}

export const ownerChannel = (userId: string) => `private-owner-${userId}`;
export const roomChannel = (roomId: string) => `private-room-${roomId}`;

export const noopRealtime: Realtime = {
  enabled: false,
  async publish() {},
  authorize() {
    throw new Error("Realtime is disabled");
  },
};

type Env = Record<string, string | undefined>;

export const resolveRealtime = (env: Env = process.env): Realtime => {
  const { PUSHER_APP_ID: appId, PUSHER_KEY: key, PUSHER_SECRET: secret, PUSHER_CLUSTER: cluster } = env;
  if (!appId || !key || !secret || !cluster) return noopRealtime;
  const pusher = new Pusher({ appId, key, secret, cluster, useTLS: true });
  return {
    enabled: true,
    async publish(channels) {
      await pusher.trigger(channels, "changed", { type: "changed" });
    },
    authorize: (socketId, channel) => pusher.authorizeChannel(socketId, channel),
  };
};

/** What the browser needs to connect; null keeps the client on polling. */
export const publicRealtimeConfig = (env: Env = process.env) =>
  env.PUSHER_KEY && env.PUSHER_CLUSTER && resolveRealtime(env).enabled ? { key: env.PUSHER_KEY, cluster: env.PUSHER_CLUSTER } : null;

export type PublicRealtimeConfig = ReturnType<typeof publicRealtimeConfig>;

let shared: Realtime | undefined;
export const getRealtime = () => (shared ??= resolveRealtime());

/** Tells the owner's inbox and the visitor's widget that a conversation changed. Never throws. */
export const notifyRoomChanged = async (db: PrismaClient, roomId: string, realtime = getRealtime()) => {
  if (!realtime.enabled) return;
  try {
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
      select: { Customer: { select: { Domain: { select: { userId: true } } } } },
    });
    const userId = room?.Customer?.Domain?.userId;
    await realtime.publish(userId ? [roomChannel(roomId), ownerChannel(userId)] : [roomChannel(roomId)]);
  } catch (error) {
    // Polling picks the change up anyway.
    console.error("Realtime publish failed", error);
  }
};

type ChannelRequest = { socketId: string; channel: string };

export const authorizeOwnerChannel = (realtime: Realtime, { socketId, channel, userId }: ChannelRequest & { userId: string }) =>
  realtime.enabled && channel === ownerChannel(userId) ? realtime.authorize(socketId, channel) : null;

export const authorizeVisitorChannel = async (
  realtime: Realtime,
  { socketId, channel, visitorId }: ChannelRequest & { visitorId: unknown },
  visitorOfRoom: (roomId: string) => Promise<string | null>,
) => {
  const roomId = channel.startsWith("private-room-") ? channel.slice("private-room-".length) : null;
  if (!realtime.enabled || !roomId || !isVisitorId(visitorId)) return null;
  return (await visitorOfRoom(roomId)) === visitorId ? realtime.authorize(socketId, channel) : null;
};
