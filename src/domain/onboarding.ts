export const MIN_FAQS = 3;

export type SiteProgress = { faqCount: number; installedAt: Date | null };

export type OnboardingStepId = "add-site" | "train-bot" | "install";

export type Onboarding = {
  steps: { id: OnboardingStepId; done: boolean }[];
  completed: boolean;
};

/** Onboarding progress, derived from the user's sites rather than stored separately. */
export const getOnboarding = (sites: SiteProgress[]): Onboarding => {
  const steps: Onboarding["steps"] = [
    { id: "add-site", done: sites.length > 0 },
    { id: "train-bot", done: sites.some((s) => s.faqCount >= MIN_FAQS) },
    { id: "install", done: sites.some((s) => s.installedAt !== null) },
  ];
  return { steps, completed: steps.every((s) => s.done) };
};
