import { createClerkClient } from "@clerk/backend";

const clerk = () => createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/** Clerk test email: "+clerk_test" addresses accept the fixed verification code 424242. */
export const testEmail = (label: string) =>
  `e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}+clerk_test@example.com`;

export const TEST_PASSWORD = "Brainance-e2e-2026!";
export const VERIFICATION_CODE = "424242";

export const createTestUser = async (label: string) => {
  const emailAddress = testEmail(label);
  await clerk().users.createUser({ emailAddress: [emailAddress], password: TEST_PASSWORD });
  return emailAddress;
};

export const deleteTestUsers = async (emails: string[]) => {
  if (!emails.length) return;
  const { data } = await clerk().users.getUserList({ emailAddress: emails });
  await Promise.all(data.map((user) => clerk().users.deleteUser(user.id)));
};
