"use server";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getOnboarding } from "@/domain/onboarding";
import { client } from "@/lib/prisma";

/** Onboarding progress for the signed-in user, plus the site the next steps act on. */
export const onGetOnboarding = async () => {
  const user = await currentUser();
  if (!user) return null;

  const sites = await client.domain.findMany({
    where: { User: { clerkId: user.id } },
    select: {
      id: true,
      name: true,
      chatBot: { select: { installedAt: true } },
      _count: { select: { helpdesk: true } },
    },
  });

  const onboarding = getOnboarding(
    sites.map((s) => ({ faqCount: s._count.helpdesk, installedAt: s.chatBot?.installedAt ?? null })),
  );
  // Beta accounts have a single site; the checklist works on the first one.
  const site = sites[0];
  return {
    ...onboarding,
    site: site ? { id: site.id, name: site.name, faqCount: site._count.helpdesk } : null,
  };
};

/** Marks the site's bot as installed. Only the site's owner can do it. */
export const onMarkInstalled = async (domainId: string) => {
  const user = await currentUser();
  if (!user) return { status: 401 };
  if (!z.string().uuid().safeParse(domainId).success) return { status: 400 };

  const { count } = await client.chatBot.updateMany({
    where: { domainId, installedAt: null, Domain: { User: { clerkId: user.id } } },
    data: { installedAt: new Date() },
  });
  revalidatePath("/dashboard");
  return { status: 200, updated: count };
};
