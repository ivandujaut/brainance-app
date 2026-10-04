import { describe, expect, it, vi } from "vitest";
import {
  authorizeOwnerChannel,
  authorizeVisitorChannel,
  noopRealtime,
  ownerChannel,
  publicRealtimeConfig,
  resolveRealtime,
  roomChannel,
  type Realtime,
} from ".";

const fake = (): Realtime & { trigger: ReturnType<typeof vi.fn> } => {
  const trigger = vi.fn().mockResolvedValue(undefined);
  return {
    enabled: true,
    trigger,
    publish: (channels) => trigger(channels, "changed", { type: "changed" }),
    authorize: (socketId, channel) => ({ auth: `signed:${socketId}:${channel}` }),
  };
};

describe("resolveRealtime", () => {
  it("is a no-op without Pusher keys, so everything runs on polling", async () => {
    const realtime = resolveRealtime({});
    expect(realtime).toBe(noopRealtime);
    expect(realtime.enabled).toBe(false);
    await expect(realtime.publish(["x"])).resolves.toBeUndefined();
  });

  it("uses Pusher when all the keys are set", () => {
    const env = { PUSHER_APP_ID: "1", PUSHER_KEY: "k", PUSHER_SECRET: "s", PUSHER_CLUSTER: "sa1" };
    expect(resolveRealtime(env).enabled).toBe(true);
    expect(publicRealtimeConfig(env)).toEqual({ key: "k", cluster: "sa1" });
    expect(publicRealtimeConfig({ PUSHER_KEY: "k" })).toBeNull();
  });
});

describe("channel authorization", () => {
  const USER = "6f1c7f4e-1f3a-4c8e-9a3b-2d1e0f9c8b7a";
  const ROOM = "0b8e9d3c-5a7f-4e21-8c6d-1f2a3b4c5d6e";
  const VISITOR = "11111111-2222-4333-8444-555555555555";

  it("lets an owner subscribe only to their own channel", () => {
    const realtime = fake();
    expect(authorizeOwnerChannel(realtime, { socketId: "1.2", channel: ownerChannel(USER), userId: USER })).toEqual({
      auth: `signed:1.2:private-owner-${USER}`,
    });
    expect(authorizeOwnerChannel(realtime, { socketId: "1.2", channel: ownerChannel("otro"), userId: USER })).toBeNull();
    expect(authorizeOwnerChannel(realtime, { socketId: "1.2", channel: roomChannel(ROOM), userId: USER })).toBeNull();
  });

  it("lets a visitor subscribe only to their own conversation", async () => {
    const realtime = fake();
    const visitorOfRoom = vi.fn(async (roomId: string) => (roomId === ROOM ? VISITOR : null));
    const request = { socketId: "1.2", channel: roomChannel(ROOM), visitorId: VISITOR };
    expect(await authorizeVisitorChannel(realtime, request, visitorOfRoom)).toEqual({ auth: `signed:1.2:private-room-${ROOM}` });
    expect(await authorizeVisitorChannel(realtime, { ...request, visitorId: crypto.randomUUID() }, visitorOfRoom)).toBeNull();
    expect(await authorizeVisitorChannel(realtime, { ...request, channel: ownerChannel(USER) }, visitorOfRoom)).toBeNull();
    expect(await authorizeVisitorChannel(realtime, { ...request, visitorId: "no-es-uuid" }, visitorOfRoom)).toBeNull();
  });

  it("authorizes nothing when push is off", async () => {
    expect(authorizeOwnerChannel(noopRealtime, { socketId: "1.2", channel: ownerChannel(USER), userId: USER })).toBeNull();
  });
});
