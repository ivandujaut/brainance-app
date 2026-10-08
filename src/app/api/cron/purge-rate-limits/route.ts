import { NextResponse, type NextRequest } from "next/server";
import { client } from "@/lib/prisma";
import { purgeRateLimitHits } from "@/server/ip-limits";

// Spec 015, criterion 10: Vercel Cron calls this once a day (vercel.json) with
// `Authorization: Bearer $CRON_SECRET`. Without the secret configured, nothing runs.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ deleted: await purgeRateLimitHits(client) });
}
