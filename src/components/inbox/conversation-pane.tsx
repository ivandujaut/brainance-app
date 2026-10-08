"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import {
  onMarkAttended,
  onMarkRead,
  onOwnerReply,
  onReleaseToBot,
  onTakeOver,
  type Conversation,
} from "@/actions/conversation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import type { AttentionReason } from "@/domain/attention";
import { ATTENTION_REASONS } from "./links";

const MAX_REPLY = 2000;

type Props = {
  conversation: Conversation;
  backHref: string;
  /** Asks the inbox to fetch what changed right away. */
  onChanged: () => Promise<void>;
  onRead: () => void;
};

const SPEAKER: Record<string, string> = { user: "Visitante", assistant: "Bot", owner: "Vos" };

export const ConversationPane = ({ conversation, backHref, onChanged, onRead }: Props) => {
  const notify = useActionToast();
  const [reply, setReply] = useState("");
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const count = conversation.messages.length;

  // Opening the conversation, or new visitor messages arriving while it is open, marks them as read.
  useEffect(() => {
    void onMarkRead(conversation.id).then(onRead);
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs per conversation and per new message
  }, [conversation.id, count]);

  type Result = { status: number; message: string };
  const run = (action: () => Promise<Result>, after?: (result: Result) => void) =>
    startTransition(async () => {
      const result = await action();
      if (result.status !== 200) notify(result);
      else after?.(result);
      await onChanged();
    });

  const send = (event?: FormEvent) => {
    event?.preventDefault();
    if (!reply.trim() || reply.length > MAX_REPLY) return;
    run(
      () => onOwnerReply(conversation.id, reply),
      () => setReply(""),
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) send(event);
  };

  return (
    <div className="h-full flex flex-col rounded-md border bg-card" data-testid="conversation-pane">
      <header className="flex flex-wrap items-center gap-3 border-b p-3">
        <Link href={backHref} className="md:hidden" aria-label="Volver a la lista">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{conversation.lead?.email ?? "Visitante"}</p>
          <p className="text-xs text-muted-foreground">{conversation.site}</p>
        </div>
        {conversation.needsAttention && (
          <Badge variant="destructive">{ATTENTION_REASONS[conversation.attentionReason as AttentionReason] ?? "Necesita atención"}</Badge>
        )}
        <Badge variant={conversation.live ? "default" : "secondary"} data-testid="conversation-mode">
          {conversation.live ? "Estás atendiendo" : "Responde el bot"}
        </Badge>
        {conversation.needsAttention && !conversation.live && (
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            title="Saca la marca sin escribirle al visitante: el bot sigue respondiendo."
            onClick={() => run(() => onMarkAttended(conversation.id), notify)}
          >
            Marcar como atendida
          </Button>
        )}
        {conversation.live ? (
          <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => onReleaseToBot(conversation.id))}>
            Devolver al bot
          </Button>
        ) : (
          <Button size="sm" disabled={pending} onClick={() => run(() => onTakeOver(conversation.id))}>
            Tomar el control
          </Button>
        )}
      </header>

      {conversation.lead && conversation.lead.responses.length > 0 && (
        <dl className="border-b px-3 py-2 text-sm grid gap-1" data-testid="conversation-lead">
          {conversation.lead.responses.map((r) => (
            <div key={r.question}>
              <dt className="inline text-muted-foreground">{r.question} </dt>
              <dd className="inline">{r.answered}</dd>
            </div>
          ))}
        </dl>
      )}

      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2" aria-live="polite">
        {conversation.messages.map((m) =>
          m.role === "system" ? (
            <p key={m.id} className="self-center text-xs text-muted-foreground text-center">
              {m.content}
            </p>
          ) : (
            <div
              key={m.id}
              data-testid="conversation-message"
              data-role={m.role}
              className={cn("max-w-[80%] flex flex-col gap-0.5", m.role === "user" ? "self-start" : "self-end items-end")}
            >
              <span className="text-xs text-muted-foreground px-1">{SPEAKER[m.role]}</span>
              <p
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words",
                  m.role === "user" && "bg-muted text-foreground rounded-bl-sm",
                  m.role === "assistant" && "bg-secondary text-secondary-foreground rounded-br-sm",
                  m.role === "owner" && "bg-primary text-primary-foreground rounded-br-sm",
                )}
              >
                {m.content}
              </p>
            </div>
          ),
        )}
      </div>

      <form onSubmit={send} className="border-t p-3 flex flex-col gap-2">
        <label htmlFor="owner-reply" className="sr-only">
          Tu respuesta
        </label>
        <Textarea
          id="owner-reply"
          rows={2}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={conversation.live ? "Escribí tu respuesta…" : "Escribí para tomar el control y responder…"}
        />
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className={reply.length > MAX_REPLY ? "text-destructive" : undefined}>
            {conversation.live ? "El bot no responde mientras atendés." : "Al responder, el bot deja de contestar."}{" "}
            {reply.length}/{MAX_REPLY}
          </span>
          <Button type="submit" size="sm" disabled={pending || !reply.trim() || reply.length > MAX_REPLY}>
            Enviar
          </Button>
        </div>
      </form>
    </div>
  );
};
