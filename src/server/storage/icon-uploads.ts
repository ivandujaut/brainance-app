// Upload caps for icons (ADR 0011), counted in IconUpload: per owner over the last day and for everyone
// over the last 30 days, so no account can spend the Blob quota that locks the store for every site.
import { iconUploadProblem } from "@/domain/icon";
import type { PrismaClient } from "@/generated/prisma/client";
import { captureWarning } from "@/server/observability";
import type { UploadQuota } from "./icons";

const DAY = 24 * 60 * 60 * 1000;

export const iconUploadQuota = (
  db: Pick<PrismaClient, "iconUpload">,
  clerkId: string,
  now = new Date(),
  warn: (message: string) => void = (message) => captureWarning(message, { area: "settings" }),
): UploadQuota => ({
  async reserve() {
    const [ownerToday, allThisMonth] = await Promise.all([
      db.iconUpload.count({ where: { clerkId, createdAt: { gt: new Date(now.getTime() - DAY) } } }),
      db.iconUpload.count({ where: { createdAt: { gt: new Date(now.getTime() - 30 * DAY) } } }),
    ]);
    const problem = iconUploadProblem({ ownerToday, allThisMonth });
    if (problem?.scope === "all") warn("Icon uploads reached the monthly cap (ADR 0011)");
    if (problem) return problem.message;
    await db.iconUpload.create({ data: { clerkId, createdAt: now } });
    return null;
  },
});
