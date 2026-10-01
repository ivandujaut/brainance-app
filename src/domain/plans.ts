import type { Plans } from "@/generated/prisma/enums";

const DOMAIN_LIMITS: Record<Plans, number> = {
  STANDARD: 1,
  PRO: 5,
  ULTIMATE: 10,
};

export const domainLimitFor = (plan: Plans): number => DOMAIN_LIMITS[plan];

export const canAddDomain = ({
  plan,
  currentDomains,
}: {
  plan: Plans | undefined;
  currentDomains: number;
}): boolean => plan !== undefined && currentDomains < domainLimitFor(plan);
