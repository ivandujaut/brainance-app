import { Prisma, type PrismaClient, type User } from "@/generated/prisma/client";

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

/** Runs a create-if-missing write; if a concurrent request won the race, reads its row instead. */
const createOrRead = async <T>(write: () => Promise<T>, read: () => Promise<T>): Promise<T> => {
  try {
    return await write();
  } catch (error) {
    if (isUniqueViolation(error)) return read();
    throw error;
  }
};

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
    () => db.user.upsert({ where: { clerkId }, update: {}, create: { clerkId, fullname } }),
    () => db.user.findUniqueOrThrow({ where: { clerkId } }),
  );
  await createOrRead(
    () => db.billings.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } }),
    () => db.billings.findUniqueOrThrow({ where: { userId: user.id } }),
  );
  return user;
};
