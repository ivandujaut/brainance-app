import { clerkClient } from "@clerk/nextjs/server";

/** The owner's current primary email, read from Clerk when needed (the database does not store it). */
export const ownerEmail = async (clerkId: string): Promise<string | null> => {
  const user = await (await clerkClient()).users.getUser(clerkId);
  return user.primaryEmailAddress?.emailAddress ?? null;
};
