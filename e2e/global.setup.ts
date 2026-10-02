import { clerkSetup } from "@clerk/testing/playwright";

// Gets a Clerk testing token so tests bypass bot protection on the dev instance.
// Without Clerk keys only the Clerk-independent specs (widget) run; the rest skip themselves.
export default async function globalSetup() {
  if (!process.env.CLERK_SECRET_KEY) return;
  await clerkSetup({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  });
}
