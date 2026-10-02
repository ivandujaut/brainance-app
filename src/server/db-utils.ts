import { Prisma } from "@/generated/prisma/client";

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

/** Runs a create-if-missing write; if a concurrent request won the race, reads its row instead. */
export const createOrRead = async <T>(write: () => Promise<T>, read: () => Promise<T>): Promise<T> => {
  try {
    return await write();
  } catch (error) {
    if (isUniqueViolation(error)) return read();
    throw error;
  }
};
