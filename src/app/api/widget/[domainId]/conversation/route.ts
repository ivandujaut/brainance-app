import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isVisitorId } from "@/domain/widget-limits";
import { client } from "@/lib/prisma";
import { listMessages } from "@/server/conversations";
import { leadCaptured } from "@/server/leads";

/** The visitor's previous messages on this site (empty if they never wrote), and whether they left their data. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await params;
  const visitorId = request.nextUrl.searchParams.get("visitorId");
  if (!z.string().uuid().safeParse(domainId).success || !isVisitorId(visitorId)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const room = await client.chatRoom.findFirst({
    where: { Customer: { domainId, visitorId } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  const [messages, captured] = await Promise.all([
    room ? listMessages(client, room.id) : [],
    leadCaptured(client, domainId, visitorId),
  ]);
  return NextResponse.json(
    { messages: messages.map(({ id, role, content }) => ({ id, role, content })), leadCaptured: captured },
    { headers: { "Cache-Control": "no-store" } },
  );
}
