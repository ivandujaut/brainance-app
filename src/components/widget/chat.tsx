"use client";
import { Send, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";
import { MAX_MESSAGE_LENGTH } from "@/domain/widget-limits";
import { cn } from "@/lib/utils";

type Message = { id: string; role: "user" | "assistant"; content: string };

type Config = { name: string; welcomeMessage: string; icon: string | null; background: string; textColor: string };

const VISITOR_KEY = "brainance:visitor";

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

export const WidgetChat = ({ domainId, config }: { domainId: string; config: Config }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Typing before hydration would be wiped out by React, so the controls wait for it.
  const hydrated = useHydrated();
  const api = `/api/widget/${domainId}`;
  const tooLong = input.trim().length > MAX_MESSAGE_LENGTH;

  useEffect(() => {
    let cancelled = false;
    fetch(`${api}/conversation?visitorId=${getVisitorId()}`)
      .then((res) => (res.ok ? res.json() : { messages: [] }))
      .then((data: { messages: Message[] }) => {
        if (!cancelled) setMessages(data.messages);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [api]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const fail = (text: string, userMessageId: string, message = GENERIC_ERROR) => {
    // Give the visitor their text back so nothing they wrote is lost.
    setMessages((prev) => prev.filter((m) => m.id !== userMessageId && m.id !== `${userMessageId}-reply`));
    setInput(text);
    setError(message);
  };

  const send = async (text: string) => {
    if (sending || !text.trim() || text.trim().length > MAX_MESSAGE_LENGTH) return;
    const userMessageId = randomId();
    const replyId = `${userMessageId}-reply`;
    setError(null);
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { id: userMessageId, role: "user", content: text.trim() }]);

    try {
      const res = await fetch(`${api}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: getVisitorId(), text }),
      });
      if (res.headers.get("content-type")?.includes("application/json")) {
        const data = (await res.json()) as { reply?: string; message?: string };
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
    <div className="h-screen w-full flex flex-col bg-white sm:rounded-2xl overflow-hidden border border-gray-200">
      <header className="flex items-center gap-3 px-4 py-3" style={accent}>
        {config.icon ? (
          <Image src={`https://ucarecdn.com/${config.icon}/`} alt="" width={32} height={32} className="rounded-full" />
        ) : (
          <span className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center font-bold uppercase">
            {config.name[0]}
          </span>
        )}
        <p className="font-semibold flex-1 truncate">{config.name}</p>
        <button
          type="button"
          aria-label="Cerrar chat"
          data-testid="widget-close"
          disabled={!hydrated}
          onClick={() => window.parent.postMessage({ type: "brainance:close" }, "*")}
        >
          <X size={20} />
        </button>
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" aria-live="polite">
        <Bubble role="assistant" accent={accent}>
          {config.welcomeMessage}
        </Bubble>
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} accent={accent}>
            {m.content || <span className="animate-pulse">…</span>}
          </Bubble>
        ))}
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

      <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-gray-200 p-3">
        <textarea
          data-testid="widget-input"
          aria-label="Escribí tu consulta"
          placeholder="Escribí tu consulta…"
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
  children,
}: {
  role: Message["role"];
  accent: { backgroundColor: string; color: string };
  children: React.ReactNode;
}) => (
  <div
    data-testid="widget-message"
    data-role={role}
    className={cn(
      "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
      role === "user" ? "self-end rounded-br-sm" : "self-start rounded-bl-sm bg-gray-100 text-gray-800",
    )}
    style={role === "user" ? accent : undefined}
  >
    {children}
  </div>
);
