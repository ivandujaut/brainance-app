import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const createClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

/**
 * The Prisma client instance.
 * Reused across hot reloads in development to avoid exhausting connections.
 */
export const client = globalThis.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = client;
}
