import { TERMS_VERSION } from "@/domain/legal";
import type { PrismaClient, User } from "@/generated/prisma/client";
import { createOrRead } from "./db-utils";

/**
 * Makes sure the Clerk user has its database user and STANDARD billing.
 * Idempotent and safe under concurrent calls; also repairs users left without billing
 * by the old two-step sign-up.
 */
export const ensureUser = async (
  db: PrismaClient,
  { clerkId, fullname }: { clerkId: string; fullname: string },
): Promise<User> => {
  const user = await createOrRead(
    // Signing up means accepting the terms shown on the sign-up page (spec 008).
    () =>
      db.user.upsert({
        where: { clerkId },
        update: {},
        create: { clerkId, fullname, termsAcceptedAt: new Date(), termsVersion: TERMS_VERSION },
      }),
    () => db.user.findUniqueOrThrow({ where: { clerkId } }),
  );
  await createOrRead(
    () => db.billings.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } }),
    () => db.billings.findUniqueOrThrow({ where: { userId: user.id } }),
  );
  return user;
};

/** Records that the owner accepted the current terms (accounts older than them, or after a change). */
export const acceptTerms = (db: PrismaClient, userId: string) =>
  db.user.update({ where: { id: userId }, data: { termsAcceptedAt: new Date(), termsVersion: TERMS_VERSION } });
