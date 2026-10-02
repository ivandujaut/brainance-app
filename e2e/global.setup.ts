import { clerkSetup } from "@clerk/testing/playwright";

// Gets a Clerk testing token so tests bypass bot protection on the dev instance.
export default async function globalSetup() {
  await clerkSetup({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  });
}
