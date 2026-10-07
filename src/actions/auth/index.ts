"use server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { siteIcon } from "@/domain/site-icon";
import { client } from "@/lib/prisma";
import { acceptTerms, ensureUser } from "@/server/users";
import { revalidatePath } from "next/cache";

/**
 * Loads the signed-in account for the dashboard. The database user is created on the
 * first visit (or repaired if an earlier sign-up left it incomplete).
 */
export const onLoadAccount = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/auth/sign-in");

  const fullname =
    clerkUser.fullName?.trim() || clerkUser.primaryEmailAddress?.emailAddress.split("@")[0] || "Usuario";
  const user = await ensureUser(client, {
    clerkId: clerkUser.id,
    fullname,
    email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
  });
  const sites = await client.domain.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, icon: true, chatBot: { select: { icon: true } } },
  });
  const domains = sites.map((site) => ({ id: site.id, name: site.name, icon: siteIcon(site) }));
  return { user, domains };
};

/** The signed-in owner accepts the current terms and privacy policy (spec 008). */
export const onAcceptTerms = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) return;
  const user = await client.user.findUnique({ where: { clerkId: clerkUser.id }, select: { id: true } });
  if (!user) return;
  await acceptTerms(client, user.id);
  revalidatePath("/", "layout");
};
