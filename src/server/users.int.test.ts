import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { ensureUser } from "./users";

// Integration test: needs a migrated Postgres in TEST_DATABASE_URL (CI provides one).
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("ensureUser", () => {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  const clerkId = "user_int_test_ensure";

  beforeEach(async () => {
    await db.user.deleteMany({ where: { clerkId } });
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    await db.$disconnect();
  });

  it("creates the user with the STANDARD plan on first visit", async () => {
    const user = await ensureUser(db, { clerkId, fullname: "Ana Pérez" });
    const billing = await db.billings.findUnique({ where: { userId: user.id } });
    expect(user.fullname).toBe("Ana Pérez");
    expect(billing?.plan).toBe("STANDARD");
  });

  it("returns the existing user on later visits without changing it", async () => {
    const first = await ensureUser(db, { clerkId, fullname: "Ana Pérez" });
    const second = await ensureUser(db, { clerkId, fullname: "Otro Nombre" });
    expect(second.id).toBe(first.id);
    expect(second.fullname).toBe("Ana Pérez");
  });

  it("creates exactly one user and one billing under concurrent first visits", async () => {
    const users = await Promise.all(
      Array.from({ length: 8 }, () => ensureUser(db, { clerkId, fullname: "Ana Pérez" })),
    );
    expect(new Set(users.map((u) => u.id)).size).toBe(1);
    expect(await db.user.count({ where: { clerkId } })).toBe(1);
    expect(await db.billings.count({ where: { userId: users[0].id } })).toBe(1);
  });

  it("repairs a user that was created without a billing record", async () => {
    const broken = await db.user.create({ data: { clerkId, fullname: "Ana Pérez" } });
    await ensureUser(db, { clerkId, fullname: "Ana Pérez" });
    expect(await db.billings.count({ where: { userId: broken.id } })).toBe(1);
  });
});
