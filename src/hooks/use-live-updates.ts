"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { pollInterval } from "@/domain/polling";

// Push as a hint, polling as the fallback (ADR 0007). `refresh` fetches what changed through the
// normal endpoints; push only says when to do it sooner.

export type RealtimeClientConfig = { key: string; cluster: string } | null;

type Options = {
  /** Fetches new data. Called on every poll and on every push event. */
  refresh: () => Promise<unknown> | void;
  /** A person attends the conversation: poll faster. */
  live: boolean;
  enabled?: boolean;
  realtime?: RealtimeClientConfig;
  /** Private channel to listen to, and how to authorize it. */
  channel?: string | null;
  authEndpoint?: string;
  authParams?: Record<string, string>;
};

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};
const useVisible = () =>
  useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true,
  );

export const useLiveUpdates = ({ refresh, live, enabled = true, realtime, channel, authEndpoint, authParams }: Options) => {
  const visible = useVisible();
  const [pushConnected, setPushConnected] = useState(false);
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  });
  const params = JSON.stringify(authParams ?? {});

  // Push: only an accelerator, loaded lazily and only when the server configured it.
  useEffect(() => {
    if (!enabled || !realtime || !channel || !authEndpoint) return;
    let disposed = false;
    let disconnect = () => {};
    void import("pusher-js").then(({ default: Pusher }) => {
      if (disposed) return;
      const pusher = new Pusher(realtime.key, {
        cluster: realtime.cluster,
        channelAuthorization: { endpoint: authEndpoint, transport: "ajax", params: JSON.parse(params) },
      });
      pusher.connection.bind("state_change", ({ current }: { current: string }) => setPushConnected(current === "connected"));
      pusher.subscribe(channel).bind("changed", () => void refreshRef.current());
      disconnect = () => pusher.disconnect();
    });
    return () => {
      disposed = true;
      disconnect();
      setPushConnected(false);
    };
  }, [enabled, realtime, channel, authEndpoint, params]);

  // Polling: adaptive, paused while the tab is hidden; catches up as soon as it is visible again.
  useEffect(() => {
    if (!enabled) return;
    const every = pollInterval({ live, visible, pushConnected });
    if (every === null) return;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const tick = async () => {
      try {
        await refreshRef.current();
      } catch {
        // A failed poll is retried on the next tick.
      }
      if (!stopped) timer = setTimeout(tick, every);
    };
    timer = setTimeout(tick, every);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [enabled, live, visible, pushConnected]);

  // Coming back to the tab: refresh right away.
  useEffect(() => {
    if (enabled && visible) void refreshRef.current();
  }, [enabled, visible]);

  return { pushConnected };
};
