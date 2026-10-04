// Human takeover of a conversation (spec 006).

/** Without a message from the owner for this long, the bot takes the conversation back. */
export const AUTO_RELEASE_MS = 30 * 60 * 1000;

export type VisitorTurn = "bot" | "owner" | "release";

/** Who handles a new visitor message: the bot, the owner (bot stays quiet), or the bot after releasing. */
export const decideVisitorTurn = ({
  liveSince,
  lastOwnerMessageAt,
  now,
}: {
  liveSince: Date | null;
  lastOwnerMessageAt: Date | null;
  now: Date;
}): VisitorTurn => {
  if (!liveSince) return "bot";
  const lastActivity =
    lastOwnerMessageAt && lastOwnerMessageAt > liveSince ? lastOwnerMessageAt : liveSince;
  return now.getTime() - lastActivity.getTime() > AUTO_RELEASE_MS ? "release" : "owner";
};

export type StoredRole = "user" | "assistant" | "owner" | "system";

/** The model sees the owner's messages as the business's replies; system notices are UI only. */
export const toModelHistory = <T extends { role: StoredRole; content: string }>(messages: readonly T[]) =>
  messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "user" ? ("user" as const) : ("assistant" as const), content: m.content }));
