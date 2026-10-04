"use client";
import Link from "next/link";
import { useState } from "react";
import {
  onGetConversation,
  onListConversations,
  type Conversation,
  type ConversationSummary,
  type InboxFilter,
} from "@/actions/conversation";
import { Badge } from "@/components/ui/badge";
import { useLiveUpdates, type RealtimeClientConfig } from "@/hooks/use-live-updates";
import { cn } from "@/lib/utils";
import { ConversationPane } from "./conversation-pane";
import { ATTENTION_REASONS, inboxHref } from "./links";

type Props = {
  sites: { id: string; name: string }[];
  siteId?: string;
  filter: InboxFilter;
  initialConversations: ConversationSummary[];
  initialSelected: Conversation | null;
  realtime: { config: NonNullable<RealtimeClientConfig>; channel: string } | null;
};

const FILTER_LABELS: Record<InboxFilter, string> = { all: "Todas", unread: "Sin leer", attention: "Necesita atención" };

const time = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

const mergeById = <T extends { id: string }>(current: T[], incoming: T[]) => {
  const known = new Set(current.map((m) => m.id));
  return [...current, ...incoming.filter((m) => !known.has(m.id))];
};

export const Inbox = ({ sites, siteId, filter, initialConversations, initialSelected, realtime }: Props) => {
  const [conversations, setConversations] = useState(initialConversations);
  const [selected, setSelected] = useState(initialSelected);

  /** Polls the list and the open conversation; push (if configured) only makes it happen sooner. */
  const refresh = async () => {
    const lastId = selected?.messages.at(-1)?.id;
    const [list, update] = await Promise.all([
      onListConversations({ siteId, filter }),
      selected ? onGetConversation(selected.id, lastId) : null,
    ]);
    setConversations(list);
    if (update) setSelected((prev) => (prev ? { ...update, messages: mergeById(prev.messages, update.messages) } : prev));
  };

  useLiveUpdates({
    refresh,
    live: Boolean(selected?.live),
    realtime: realtime?.config ?? null,
    channel: realtime?.channel ?? null,
    authEndpoint: "/api/realtime/auth",
  });

  const pill = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-sm whitespace-nowrap",
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    );

  return (
    <div className="flex-1 h-0 w-full flex flex-col gap-4 pb-4">
      <header className={cn(selected && "hidden md:block")}>
        <h1 className="text-3xl font-bold">Conversaciones</h1>
        <p className="text-sm text-muted-foreground">Lo que hablan tus visitantes con el bot. Podés tomar el control y responder.</p>
      </header>

      <div className="flex-1 min-h-0 grid gap-4 md:grid-cols-[minmax(260px,340px)_1fr]">
        <section className={cn("min-h-0 flex flex-col gap-3", selected && "hidden md:flex")} aria-label="Lista de conversaciones">
          <nav aria-label="Filtros" className="flex flex-wrap gap-2">
            {(Object.keys(FILTER_LABELS) as InboxFilter[]).map((f) => (
              <Link key={f} href={inboxHref({ siteId, filter: f })} className={pill(f === filter)} aria-current={f === filter ? "page" : undefined}>
                {FILTER_LABELS[f]}
              </Link>
            ))}
          </nav>
          {sites.length > 1 && (
            <nav aria-label="Sitios" className="flex flex-wrap gap-2">
              <Link href={inboxHref({ filter })} className={pill(!siteId)}>
                Todos los sitios
              </Link>
              {sites.map((s) => (
                <Link key={s.id} href={inboxHref({ siteId: s.id, filter })} className={pill(s.id === siteId)}>
                  {s.name}
                </Link>
              ))}
            </nav>
          )}

          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6" data-testid="inbox-empty">
              {filter === "all" ? "Todavía no hay conversaciones. Aparecen cuando un visitante escribe en el chat." : "No hay conversaciones con este filtro."}
            </p>
          ) : (
            <ul className="min-h-0 overflow-y-auto flex flex-col divide-y rounded-md border" data-testid="inbox-list">
              {conversations.map((c) => (
                <li key={c.id}>
                  <Link
                    href={inboxHref({ siteId, filter, c: c.id })}
                    data-testid="inbox-item"
                    aria-current={c.id === selected?.id ? "true" : undefined}
                    className={cn("flex flex-col gap-1 p-3 hover:bg-accent", c.id === selected?.id && "bg-accent")}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn("flex-1 truncate", c.unread ? "font-semibold" : "font-medium")}>{c.visitor}</span>
                      {c.unread > 0 && (
                        <Badge aria-label={`${c.unread} sin leer`} data-testid="inbox-unread">
                          {c.unread}
                        </Badge>
                      )}
                    </span>
                    <span className="truncate text-sm text-muted-foreground">{c.lastMessage}</span>
                    <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {c.site} · {time.format(new Date(c.lastMessageAt))}
                      {c.live && <Badge variant="secondary">Atendiendo</Badge>}
                      {c.needsAttention && (
                        <Badge variant="destructive" title={ATTENTION_REASONS[c.attentionReason ?? ""]}>
                          Necesita atención
                        </Badge>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={cn("min-h-0", !selected && "hidden md:block")} aria-label="Conversación">
          {selected ? (
            <ConversationPane
              conversation={selected}
              backHref={inboxHref({ siteId, filter })}
              onChanged={refresh}
              onRead={() => setConversations((list) => list.map((c) => (c.id === selected.id ? { ...c, unread: 0 } : c)))}
            />
          ) : (
            <div className="h-full rounded-md border flex items-center justify-center p-6 text-sm text-muted-foreground">
              Elegí una conversación para verla.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
