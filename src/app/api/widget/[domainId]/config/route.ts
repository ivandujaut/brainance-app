import { NextResponse, type NextRequest } from "next/server";
import { originMatchesDomain } from "@/domain/widget-origin";
import { client } from "@/lib/prisma";
import { allowHttpOrigins, getWidgetSite, markInstalled, toPublicConfig } from "@/server/widget-site";
import { z } from "zod";

// Requested by widget.js from the customer's page, so it answers any origin.
const CORS = { "Access-Control-Allow-Origin": "*", Vary: "Origin" };

export async function GET(request: NextRequest, { params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await params;
  const site = z.string().uuid().safeParse(domainId).success ? await getWidgetSite(client, domainId) : null;
  if (!site) return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS });

  // Browsers always send Origin on cross-origin fetches, so this only fires on the real site.
  if (originMatchesDomain(request.headers.get("origin"), site.name, { allowHttp: allowHttpOrigins() })) {
    await markInstalled(client, site.id);
  }
  return NextResponse.json(toPublicConfig(site), { headers: { ...CORS, "Cache-Control": "no-store" } });
}
