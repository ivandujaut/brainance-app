import { DAILY_REASONS, type AttentionReason } from "@/domain/attention";
import {
  ATTENTION_NOTICE_LIMITS,
  buildAttentionEmail,
  decideAttentionNotice,
  type Exchange,
} from "@/domain/attention-notice";
import type { PrismaClient } from "@/generated/prisma/client";
import { listMessages } from "./conversations";
import type { Email, EmailSender } from "./email";
import type { FlagResult } from "./live";
import { captureError, captureWarning } from "./observability";

// Emails to the owner (specs 005 and 010), behind the EmailSender interface (ADR 0006).

export type OwnerNoticeDeps = {
  sender: EmailSender;
  ownerEmail: (clerkId: string) => Promise<string | null>;
  appUrl: string;
};

/** Sends one email to the owner. Never throws: callers already stored what the email is about. */
export const sendOwnerEmail = async (
  ownerClerkId: string,
  email: Omit<Email, "to">,
  { sender, ownerEmail }: Pick<OwnerNoticeDeps, "sender" | "ownerEmail">,
) => {
  try {
    const to = await ownerEmail(ownerClerkId);
    if (!to) throw new Error(`Owner ${ownerClerkId} has no email address`);
    await sender.send({ to, ...email });
    return true;
  } catch (error) {
    captureError(error, { area: "email" });
    return false;
  }
};

const DAY_MS = 24 * 60 * 60_000;

/** The last visitor question + bot answer pairs, oldest first. */
const lastExchanges = (messages: { role: string; content: string }[], limit: number): Exchange[] => {
  const pairs: Exchange[] = [];
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role !== "user") continue;
    const next = messages[i + 1];
    if (next?.role === "assistant") pairs.push({ question: messages[i].content, answer: next.content });
  }
  return pairs.slice(-limit);
};

type AttentionEvent = { roomId: string; domainId: string; reason: AttentionReason; flagged: FlagResult; now: Date };

export type AttentionNoticeResult = "notify" | "remind" | "failed" | `skip:${string}`;

/**
 * Emails the owner about a conversation that needs them (spec 010). Called after `flagAttention`,
 * off the response path. Never throws.
 */
export const notifyAttention = async (
  db: PrismaClient,
  { roomId, domainId, reason, flagged, now }: AttentionEvent,
  deps: OwnerNoticeDeps,
): Promise<AttentionNoticeResult> => {
  const since = new Date(now.getTime() - DAY_MS);
  const [room, site, noticesToday, reasonNoticedToday] = await Promise.all([
    db.chatRoom.findUniqueOrThrow({
      where: { id: roomId },
      select: {
        liveSince: true,
        attentionNotifiedAt: true,
        attentionNotices: true,
        Customer: { select: { email: true, leadAt: true } },
      },
    }),
    db.domain.findUniqueOrThrow({
      where: { id: domainId },
      select: { name: true, chatBot: { select: { attentionEmail: true } }, User: { select: { clerkId: true } } },
    }),
    db.chatRoom.count({ where: { Customer: { domainId }, attentionNotifiedAt: { gte: since } } }),
    // The cap and model failures are told once a day per site (spec 010, criterion 4; spec 014).
    DAILY_REASONS.includes(reason)
      ? db.chatRoom
          .count({ where: { Customer: { domainId }, attentionReason: reason, attentionNotifiedAt: { gte: since } } })
          .then((n) => n > 0)
      : false,
  ]);
  const decision = decideAttentionNotice({
    reason,
    enabled: site.chatBot?.attentionEmail ?? true,
    needsAttentionBefore: flagged.wasFlagged,
    liveSince: room.liveSince,
    attentionNotifiedAt: room.attentionNotifiedAt,
    attentionNotices: room.attentionNotices,
    noticesToday,
    reasonNoticedToday,
    now,
  });
  if (decision.action === "skip") {
    if (decision.why === "site_daily_limit") {
      captureWarning("Attention notices over the site's daily limit", {
        area: "email",
        domainId,
        extra: { noticesToday },
      });
    }
    return `skip:${decision.why}`;
  }
  if (!site.User) return "skip:no_owner";

  const exchanges = lastExchanges(await listMessages(db, roomId, 20), ATTENTION_NOTICE_LIMITS.exchanges);
  const email = buildAttentionEmail({
    siteName: site.name,
    reason,
    exchanges,
    visitorEmail: room.Customer?.leadAt && room.Customer.email ? room.Customer.email : null,
    conversationUrl: `${deps.appUrl}/conversations?c=${roomId}`,
    reminder: decision.action === "remind",
  });
  if (!(await sendOwnerEmail(site.User.clerkId, email, deps))) return "failed";
  await db.chatRoom.update({
    where: { id: roomId },
    data: { attentionNotifiedAt: now, attentionNotices: { increment: 1 } },
  });
  return decision.action;
};
