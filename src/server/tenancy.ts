import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { client } from "@/lib/prisma";

/*
 * Tenant isolation (ADR 0004). A tenant is an owner account (User); everything else hangs from
 * it: User → Domain → ChatBot / HelpDesk / FilterQuestions / Customer → ChatRoom → ChatMessage.
 * Server actions receive ids from the browser, so every id is resolved through these helpers,
 * which only find rows owned by the signed-in user. A missing, malformed or foreign id all
 * return null: callers cannot tell them apart, so nothing leaks about other tenants.
 */

const uuid = z.string().uuid();

/** Clerk id of the signed-in owner, or null for anonymous callers. */
export const currentOwnerId = async (): Promise<string | null> => (await currentUser())?.id ?? null;

/** Prisma filter for a site owned by `clerkId`. */
export const ownedSiteWhere = (clerkId: string, id: string) => ({ id, User: { clerkId } });

/** Prisma filter for a conversation on one of `clerkId`'s sites. */
export const ownedChatRoomWhere = (clerkId: string, id: string) => ({
  id,
  Customer: { Domain: { User: { clerkId } } },
});

/** The signed-in owner's site with this id, or null. */
export const findOwnedSite = async (id: unknown) => {
  const owner = await currentOwnerId();
  if (!owner || !uuid.safeParse(id).success) return null;
  return client.domain.findFirst({
    where: ownedSiteWhere(owner, id as string),
    select: { id: true, name: true, userId: true },
  });
};

/** A conversation on one of the signed-in owner's sites, or null. */
export const findOwnedChatRoom = async (id: unknown) => {
  const owner = await currentOwnerId();
  if (!owner || !uuid.safeParse(id).success) return null;
  return client.chatRoom.findFirst({ where: ownedChatRoomWhere(owner, id as string), select: { id: true } });
};
