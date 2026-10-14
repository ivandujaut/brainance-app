import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ICON_UPLOAD_LIMITS } from "@/domain/icon";

// ADR 0011: icon uploads are capped per owner and per month, counted in IconUpload.
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

const OWNER = "user_int_icon_quota";
const OTHER = "user_int_icon_quota_other";
const DAY = 24 * 60 * 60 * 1000;

describe.skipIf(!url)("iconUploadQuota", async () => {
  const { client: db } = await import("@/lib/prisma");
  const { iconUploadQuota } = await import("./icon-uploads");
  const now = new Date();
  const ago = (ms: number) => new Date(now.getTime() - ms);

  beforeEach(async () => {
    await db.iconUpload.deleteMany({});
  });

  afterAll(async () => {
    await db.iconUpload.deleteMany({});
    await db.$disconnect();
  });

  const seed = (clerkId: string, count: number, createdAt: Date) =>
    db.iconUpload.createMany({ data: Array.from({ length: count }, () => ({ clerkId, createdAt })) });

  it("counts the upload when there's room", async () => {
    await expect(iconUploadQuota(db, OWNER, now).reserve()).resolves.toBeNull();
    expect(await db.iconUpload.count({ where: { clerkId: OWNER } })).toBe(1);
  });

  it("stops an owner at the daily limit, and lets them upload again a day later", async () => {
    await seed(OWNER, ICON_UPLOAD_LIMITS.perOwnerPerDay, ago(60_000));
    await expect(iconUploadQuota(db, OWNER, now).reserve()).resolves.toMatch(/por día/);
    await expect(iconUploadQuota(db, OTHER, now).reserve()).resolves.toBeNull();

    await db.iconUpload.updateMany({ where: { clerkId: OWNER }, data: { createdAt: ago(DAY + 60_000) } });
    await expect(iconUploadQuota(db, OWNER, now).reserve()).resolves.toBeNull();
  });

  it("stops everyone at the monthly limit, without counting the refused upload", async () => {
    const warn = vi.fn();
    await seed(OTHER, ICON_UPLOAD_LIMITS.allPerMonth, ago(10 * DAY));
    await expect(iconUploadQuota(db, OWNER, now, warn).reserve()).resolves.toMatch(/por ahora/);
    expect(warn).toHaveBeenCalledOnce();
    expect(await db.iconUpload.count({ where: { clerkId: OWNER } })).toBe(0);

    await db.iconUpload.updateMany({ data: { createdAt: ago(31 * DAY) } });
    await expect(iconUploadQuota(db, OWNER, now, warn).reserve()).resolves.toBeNull();
  });
});
