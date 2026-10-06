import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ucarecdn.com',
            },
            // New Uploadcare projects serve from their own subdomain (NEXT_PUBLIC_UPLOAD_CARE_CDN_URL).
            {
                protocol: 'https',
                hostname: '*.ucarecd.net',
            },
        ]
    }
};

// Source maps go to Sentry only when the build has a token (ADR 0008); otherwise the build is unchanged.
export default process.env.SENTRY_AUTH_TOKEN
    ? withSentryConfig(nextConfig, {
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          silent: true,
          sourcemaps: { deleteSourcemapsAfterUpload: true },
      })
    : nextConfig;
