import { describe, expect, it } from "vitest";
import { getOnboarding, MIN_FAQS } from "./onboarding";

const site = (faqCount: number, installedAt: Date | null = null) => ({ faqCount, installedAt });
const done = (domains: Parameters<typeof getOnboarding>[0]) =>
  Object.fromEntries(getOnboarding(domains).steps.map((s) => [s.id, s.done]));

describe("getOnboarding", () => {
  it("starts with every step pending when the user has no sites", () => {
    expect(done([])).toEqual({ "add-site": false, "train-bot": false, install: false });
    expect(getOnboarding([]).completed).toBe(false);
  });

  it("completes the first step once a site exists", () => {
    expect(done([site(0)])["add-site"]).toBe(true);
  });

  it(`completes training once a site has at least ${MIN_FAQS} FAQs`, () => {
    expect(done([site(MIN_FAQS - 1)])["train-bot"]).toBe(false);
    expect(done([site(MIN_FAQS)])["train-bot"]).toBe(true);
  });

  it("completes installation once a site's bot is marked as installed", () => {
    expect(done([site(0, new Date())]).install).toBe(true);
  });

  it("counts progress across all the user's sites", () => {
    expect(done([site(0), site(5)])["train-bot"]).toBe(true);
  });

  it("is completed only when every step is done", () => {
    expect(getOnboarding([site(MIN_FAQS)]).completed).toBe(false);
    expect(getOnboarding([site(MIN_FAQS, new Date())]).completed).toBe(true);
  });
});
