// How the widget merges what polling brings into what it already shows (spec 006, ADR 0007).

export type WidgetMessage = { id: string; role: "user" | "assistant" | "owner" | "system"; content: string };

/** Messages not yet confirmed by the server carry a local id until polling brings the stored copy. */
export const LOCAL_ID_PREFIX = "local-";

const isLocal = (message: WidgetMessage) => message.id.startsWith(LOCAL_ID_PREFIX);

/**
 * Adds the server's messages (`incoming`, oldest first, all after the widget's cursor) in the order
 * they were stored. Each one replaces its local copy, if any; local copies the server does not have
 * yet stay at the end. QA of spec 011: appending new messages after the local copies put the
 * owner's takeover below a visitor message sent later.
 */
export const mergeMessages = (current: WidgetMessage[], incoming: WidgetMessage[]): WidgetMessage[] => {
  const incomingIds = new Set(incoming.map((m) => m.id));
  const pendingLocals = current.filter(isLocal);
  for (const message of incoming) {
    const copy = pendingLocals.findIndex((m) => m.role === message.role && m.content === message.content);
    if (copy !== -1) pendingLocals.splice(copy, 1);
  }
  const stored = current.filter((m) => !isLocal(m) && !incomingIds.has(m.id));
  return [...stored, ...incoming, ...pendingLocals];
};
