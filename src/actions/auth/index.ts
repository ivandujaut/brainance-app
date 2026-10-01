"use server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { client } from "@/lib/prisma";
import { ensureUser } from "@/server/users";

/**
 * Loads the signed-in account for the dashboard. The database user is created on the
 * first visit (or repaired if an earlier sign-up left it incomplete).
 */
export const onLoadAccount = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/auth/sign-in");

  const fullname =
    clerkUser.fullName?.trim() || clerkUser.primaryEmailAddress?.emailAddress.split("@")[0] || "Usuario";
  const user = await ensureUser(client, { clerkId: clerkUser.id, fullname });
  const domains = await client.domain.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, icon: true },
  });
  return { user, domains };
};
