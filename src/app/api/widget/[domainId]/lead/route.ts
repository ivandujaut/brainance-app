import { after, NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isVisitorId } from "@/domain/widget-limits";
import { getAppUrl } from "@/lib/app-url";
import { client } from "@/lib/prisma";
import { admitLead, requestFingerprint } from "@/server/ip-limits";
import { resolveEmailSender } from "@/server/email";
import { saveLead, sendLeadNotice } from "@/server/leads";
import { ownerEmail } from "@/server/owner-email";

// Spec 005: the visitor leaves their email and answers from the lead card. Called from the widget
// iframe, which is served by this app, so it needs no CORS.
const body = z.object({ visitorId: z.string() }).passthrough();

export async function POST(request: NextRequest, { params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await params;
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!z.string().uuid().safeParse(domainId).success || !parsed.success || !isVisitorId(parsed.data.visitorId)) {
    return NextResponse.json({ message: "No pudimos guardar tus datos." }, { status: 400 });
  }

  // Spec 015, criterion 6: contact forms per IP and site, before anything is stored.
  const fingerprint = requestFingerprint(request.headers);
  if (fingerprint && !(await admitLead(client, { fingerprint, domainId })).ok) {
    return NextResponse.json(
      { message: "Se enviaron muchos datos desde tu conexión. Esperá un rato y volvé a intentar." },
      { status: 429 },
    );
  }

  const result = await saveLead(client, { domainId, visitorId: parsed.data.visitorId, input: parsed.data });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });

  const { notice } = result;
  if (notice) {
    // Sent after the response: the visitor's confirmation never waits on (or fails because of) the email.
    after(() => sendLeadNotice(notice, { sender: resolveEmailSender(), ownerEmail, appUrl: getAppUrl() }));
  }
  return NextResponse.json({ email: result.email }, { headers: { "Cache-Control": "no-store" } });
}
