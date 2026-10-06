import { createClerkClient } from "@clerk/backend";
import { clerk } from "@clerk/testing/playwright";
import type { Page } from "@playwright/test";

const backend = () => createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/** Clerk test email: "+clerk_test" addresses accept the fixed verification code 424242. */
export const testEmail = (label: string) =>
  `e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}+clerk_test@example.com`;

export const TEST_PASSWORD = "Brainance-e2e-2026!";
export const VERIFICATION_CODE = "424242";

export const createTestUser = async (label: string) => {
  const emailAddress = testEmail(label);
  await backend().users.createUser({ emailAddress: [emailAddress], password: TEST_PASSWORD });
  return emailAddress;
};

export const deleteTestUsers = async (emails: string[]) => {
  if (!emails.length) return;
  const { data } = await backend().users.getUserList({ emailAddress: emails });
  await Promise.all(data.map((user) => backend().users.deleteUser(user.id)));
};

/**
 * Signs the test user in. It starts from the sign-in page because clerk.signIn needs a page that
 * loads Clerk, and the landing and legal pages don't (spec 008: they're static, outside Clerk).
 */
export const signInAs = async (page: Page, emailAddress: string) => {
  await page.goto("/auth/sign-in");
  await clerk.signIn({ page, emailAddress });
};
