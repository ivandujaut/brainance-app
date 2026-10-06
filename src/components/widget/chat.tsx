"use client";
import { Send, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";
import { MAX_MESSAGE_LENGTH } from "@/domain/widget-limits";
import { useLiveUpdates, type RealtimeClientConfig } from "@/hooks/use-live-updates";
import { uploadcareUrl } from "@/lib/uploadcare";
import { cn } from "@/lib/utils";
import { LeadCard, type LeadQuestion } from "./lead-card";

type Role = "user" | "assistant" | "owner" | "system";
type Message = { id: string; role: Role; content: string };

/** Messages not yet confirmed by the server carry a local id until polling brings the stored copy. */
const LOCAL = "local-";

/** Adds the server's messages, replacing the local copy of each one and skipping those already shown. */
const mergeMessages = (current: Message[], incoming: Message[]) => {
  const next = [...current];
  for (const message of incoming) {
    if (next.some((m) => m.id === message.id)) continue;
    const local = next.findIndex((m) => m.id.startsWith(LOCAL) && m.role === message.role && m.content === message.content);
    if (local === -1) next.push(message);
    else next[local] = message;
  }
  return next;
};

export type WidgetConfig = {
  name: string;
  welcomeMessage: string;
  icon: string | null;
  background: string;
  textColor: string;
  leadCapture?: boolean;
  leadQuestions?: LeadQuestion[];
  /** Pusher, when configured; otherwise the chat keeps up by polling (ADR 0007). */
  realtime?: RealtimeClientConfig;
};

const VISITOR_KEY = "brainance:visitor";
const LEAD_DISMISSED_KEY = "brainance:lead-dismissed";

const readFlag = (key: string) => {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};
const writeFlag = (key: string) => {
  try {
    localStorage.setItem(key, "1");
  } catch {
    // Storage blocked: the card stays dismissed for this tab only.
  }
};

/** UUID v4 that also works outside secure contexts, where crypto.randomUUID is missing. */
const randomId = (): string => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
let memoryVisitorId: string | undefined;

/** Anonymous id kept in this site's (partitioned) storage; falls back to the tab's memory if storage is blocked. */
const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    memoryVisitorId ??= randomId();
    return memoryVisitorId;
  }
};

const subscribeNoop = () => () => {};
/** False during server render and hydration; true once React owns the DOM. */
const useHydrated = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

const GENERIC_ERROR = "No pudimos enviar tu mensaje. Revisá tu conexión y probá de nuevo.";

type Props = {
  domainId: string;
  config: WidgetConfig;
  /** Settings page preview: shows the look only, never reads or writes a conversation. */
  preview?: boolean;
};

export const WidgetChat = ({ domainId, config, preview = false }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Lead card (spec 005): offered once after the first answer; "Dejar mis datos" reopens it.
  const [lead, setLead] = useState({ captured: false, dismissed: false, open: false, thanks: null as string | null });
  // Spec 006: whether a person of the business attends the conversation, and the room for push.
  const [live, setLive] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const cursor = useRef<string | null>(null);
  const sendingRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  // Typing before hydration would be wiped out by React, so the controls wait for it.
  const hydrated = useHydrated() && !preview;
  const api = `/api/widget/${domainId}`;
  const tooLong = input.trim().length > MAX_MESSAGE_LENGTH;

  useEffect(() => {
    if (preview) return;
    let cancelled = false;
    fetch(`${api}/conversation?visitorId=${getVisitorId()}`)
      .then((res) => (res.ok ? res.json() : { messages: [] }))
      .then((data: { messages: Message[]; leadCaptured?: boolean; live?: boolean; roomId?: string | null }) => {
        if (cancelled) return;
        setMessages(data.messages);
        cursor.current = data.messages.at(-1)?.id ?? null;
        setLive(Boolean(data.live));
        setRoomId(data.roomId ?? null);
        setLead((prev) => ({
          ...prev,
          captured: Boolean(data.leadCaptured),
          dismissed: readFlag(`${LEAD_DISMISSED_KEY}:${domainId}`),
        }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [api, domainId, preview]);

  /** New messages since the last one we have (owner replies, notices, the stored copy of ours). */
  const refresh = async () => {
    // While an answer streams, its stored copy is not final yet: catch up when it ends.
    if (sendingRef.current) return;
    const after = cursor.current ? `&after=${cursor.current}` : "";
    const res = await fetch(`${api}/conversation?visitorId=${getVisitorId()}${after}`);
    if (!res.ok) return;
    const data = (await res.json()) as { messages: Message[]; live: boolean; roomId: string | null };
    if (data.messages.length) {
      cursor.current = data.messages.at(-1)!.id;
      setMessages((prev) => mergeMessages(prev, data.messages));
    }
    setLive(data.live);
    setRoomId(data.roomId);
  };

  useLiveUpdates({
    refresh,
    live,
    enabled: hydrated,
    realtime: config.realtime,
    channel: roomId ? `private-room-${roomId}` : null,
    authEndpoint: `${api}/realtime/auth`,
    authParams: hydrated ? { visitorId: getVisitorId() } : undefined,
  });

  const leadEnabled = !preview && config.leadCapture === true;
  const answered = messages.some((m) => (m.role === "assistant" || m.role === "owner") && m.content.trim());
  const showLeadCard = leadEnabled && (lead.open || (answered && !sending && !lead.captured && !lead.dismissed));

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, showLeadCard, lead.thanks]);

  const submitLead = async (data: { email: string; answers: { questionId: string; answer: string }[] }) => {
    try {
      const res = await fetch(`${api}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: getVisitorId(), ...data }),
      });
      const body = (await res.json().catch(() => ({}))) as { email?: string; message?: string };
      if (!res.ok) return body.message ?? "No pudimos guardar tus datos. Probá de nuevo.";
      setLead((prev) => ({
        ...prev,
        captured: true,
        open: false,
        thanks: `¡Gracias! ${config.name} te va a contactar a ${body.email ?? data.email}.`,
      }));
      return null;
    } catch {
      return "No pudimos guardar tus datos. Revisá tu conexión y probá de nuevo.";
    }
  };

  const dismissLead = () => {
    writeFlag(`${LEAD_DISMISSED_KEY}:${domainId}`);
    setLead((prev) => ({ ...prev, dismissed: true, open: false }));
  };

  const fail = (text: string, userMessageId: string, message = GENERIC_ERROR) => {
    // Give the visitor their text back so nothing they wrote is lost.
    setMessages((prev) => prev.filter((m) => m.id !== userMessageId && m.id !== `${userMessageId}-reply`));
    setInput(text);
    setError(message);
  };

  const send = async (text: string) => {
    if (sending || !text.trim() || text.trim().length > MAX_MESSAGE_LENGTH) return;
    const userMessageId = `${LOCAL}${randomId()}`;
    const replyId = `${userMessageId}-reply`;
    setError(null);
    setInput("");
    setSending(true);
    sendingRef.current = true;
    setMessages((prev) => [...prev, { id: userMessageId, role: "user", content: text.trim() }]);

    try {
      const res = await fetch(`${api}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: getVisitorId(), text }),
      });
      if (res.headers.get("content-type")?.includes("application/json")) {
        const data = (await res.json()) as { reply?: string; message?: string; live?: boolean; id?: string };
        if (res.ok && data.live && data.id) {
          // A person attends the conversation: no bot reply, the owner answers from the inbox.
          setMessages((prev) => prev.map((m) => (m.id === userMessageId ? { ...m, id: data.id! } : m)));
          setLive(true);
          return;
        }
        if (!res.ok || !data.reply) return fail(text, userMessageId, data.message);
        setMessages((prev) => [...prev, { id: replyId, role: "assistant", content: data.reply! }]);
        return;
      }
      if (!res.ok || !res.body) return fail(text, userMessageId);

      setMessages((prev) => [...prev, { id: replyId, role: "assistant", content: "" }]);
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += value;
        setMessages((prev) => prev.map((m) => (m.id === replyId ? { ...m, content: answer } : m)));
      }
      if (!answer.trim()) fail(text, userMessageId);
    } catch {
      fail(text, userMessageId);
    } finally {
      setSending(false);
      sendingRef.current = false;
      // Swap the local copies for the stored ones and pick up the room for push.
      void refresh().catch(() => {});
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(input);
    }
  };

  const accent = { backgroundColor: config.background, color: config.textColor };

  return (
    <div
      className={cn(
        "w-full flex flex-col bg-white overflow-hidden border border-gray-200",
        preview ? "h-full rounded-2xl" : "h-screen sm:rounded-2xl",
      )}
    >
      <header className="flex items-center gap-3 px-4 py-3" style={accent}>
        {config.icon ? (
          <Image src={uploadcareUrl(config.icon)} alt="" width={32} height={32} className="rounded-full" />
        ) : (
          <span className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center font-bold uppercase">
            {config.name[0]}
          </span>
        )}
        <p className="font-semibold flex-1 truncate">{config.name}</p>
        {!preview && (
          <button
            type="button"
            aria-label="Cerrar chat"
            data-testid="widget-close"
            disabled={!hydrated}
            onClick={() => window.parent.postMessage({ type: "brainance:close" }, "*")}
          >
            <X size={20} />
          </button>
        )}
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" aria-live="polite">
        <Bubble role="assistant" accent={accent}>
          {config.welcomeMessage}
        </Bubble>
        {messages.map((m) =>
          m.role === "system" ? (
            <p key={m.id} data-testid="widget-notice" className="self-center text-center text-xs text-gray-600 px-4">
              {m.content}
            </p>
          ) : (
            <Bubble key={m.id} role={m.role} accent={accent} label={m.role === "owner" ? config.name : undefined}>
              {m.content || <span className="animate-pulse">…</span>}
            </Bubble>
          ),
        )}
        {lead.thanks && (
          <Bubble role="assistant" accent={accent}>
            <span data-testid="lead-thanks">{lead.thanks}</span>
          </Bubble>
        )}
        {showLeadCard && (
          <LeadCard
            businessName={config.name}
            questions={config.leadQuestions ?? []}
            accent={accent}
            onSubmit={submitLead}
            onDismiss={dismissLead}
          />
        )}
      </div>

      {error && (
        <p role="alert" data-testid="widget-error" className="mx-4 mb-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {tooLong && (
        <p role="alert" className="mx-4 mb-2 text-sm text-red-600">
          Tu mensaje supera los {MAX_MESSAGE_LENGTH} caracteres ({input.trim().length}).
        </p>
      )}

      {leadEnabled && !showLeadCard && (
        <button
          type="button"
          data-testid="lead-open"
          disabled={!hydrated}
          onClick={() => setLead((prev) => ({ ...prev, open: true, thanks: null }))}
          className="mx-4 mb-2 self-start text-sm text-gray-700 underline underline-offset-2"
        >
          Dejar mis datos
        </button>
      )}

      <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-gray-200 p-3">
        <textarea
          data-testid="widget-input"
          aria-label="Escribí tu consulta"
          placeholder={preview ? "Así lo ven tus visitantes" : "Escribí tu consulta…"}
          rows={1}
          disabled={!hydrated}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <button
          type="submit"
          aria-label="Enviar"
          data-testid="widget-send"
          disabled={!hydrated || sending || !input.trim() || tooLong}
          className="rounded-full p-2 disabled:opacity-40"
          style={accent}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

const Bubble = ({
  role,
  accent,
  label,
  children,
}: {
  role: Exclude<Role, "system">;
  accent: { backgroundColor: string; color: string };
  /** Shown above the owner's messages, so the visitor tells a person from the bot. */
  label?: string;
  children: React.ReactNode;
}) => (
  <div className={cn("max-w-[85%] flex flex-col gap-0.5", role === "user" ? "self-end" : "self-start")}>
    {label && <span className="text-xs font-medium text-gray-600 px-1">{label}</span>}
    <div
      data-testid="widget-message"
      data-role={role}
      className={cn(
        "rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
        role === "user" && "rounded-br-sm",
        role === "assistant" && "rounded-bl-sm bg-gray-100 text-gray-800",
        role === "owner" && "rounded-bl-sm border border-gray-300 bg-white text-gray-900",
      )}
      style={role === "user" ? accent : undefined}
    >
      {children}
    </div>
  </div>
);
