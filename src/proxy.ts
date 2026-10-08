import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { frameAncestors } from "@/domain/widget-origin";
import { client } from "@/lib/prisma";
import { allowHttpOrigins } from "@/server/widget-site";

const isPublicRoute = createRouteMatcher(["/auth(.*)", "/images(.*)"]);

const clerk = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The chat iframe page may only be embedded by its own site (spec 003, ADR 0003). */
const widgetPage = async (req: NextRequest) => {
  const domainId = req.nextUrl.pathname.split("/")[2] ?? "";
  const site = UUID.test(domainId)
    ? await client.domain.findUnique({ where: { id: domainId }, select: { name: true } })
    : null;
  const response = NextResponse.next();
  response.headers.set(
    "Content-Security-Policy",
    frameAncestors(site?.name ?? null, { allowHttp: allowHttpOrigins() }),
  );
  return response;
};

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  // The widget runs inside customers' sites for anonymous visitors: no Clerk session involved.
  if (pathname.startsWith("/widget/")) return widgetPage(req);
  if (pathname.startsWith("/api/widget/")) return NextResponse.next();
  // Vercel Cron: authenticated by CRON_SECRET in the route, not by a Clerk session (spec 015).
  if (pathname.startsWith("/api/cron/")) return NextResponse.next();
  // Landing and legal pages are static and public (spec 008): readable even if Clerk is down.
  if (pathname === "/" || pathname === "/terminos" || pathname === "/privacidad" || pathname === "/como-medimos") {
    return NextResponse.next();
  }
  return clerk(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
