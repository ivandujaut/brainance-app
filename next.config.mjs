import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            // Site and bot icons (ADR 0011): public files in the project's Vercel Blob store.
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
                pathname: '/icons/**',
            },
        ]
    },
    experimental: {
        // onUploadIcon takes images up to 2 MB; the default limit for a server action is 1 MB.
        serverActions: { bodySizeLimit: '3mb' },
    },
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
