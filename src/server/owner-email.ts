import { clerkClient } from "@clerk/nextjs/server";
import { client } from "@/lib/prisma";

/**
 * The owner's email for notices (specs 005 and 010): the copy stored at sign-in, or Clerk for
 * accounts provisioned before it was stored (the copy is saved for next time).
 */
export const ownerEmail = async (clerkId: string): Promise<string | null> => {
  const stored = await client.user.findUnique({ where: { clerkId }, select: { email: true } });
  if (stored?.email) return stored.email;
  const user = await (await clerkClient()).users.getUser(clerkId);
  const email = user.primaryEmailAddress?.emailAddress ?? null;
  if (email) await client.user.updateMany({ where: { clerkId }, data: { email } });
  return email;
};
