import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isVisitorId } from "@/domain/widget-limits";
import { client } from "@/lib/prisma";
import { listMessages } from "@/server/conversations";
import { leadCaptured } from "@/server/leads";

/**
 * The visitor's conversation on this site: messages (only new ones with `after`), whether a person is
 * attending it, and whether the visitor left their data. Without the right visitorId there is nothing.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await params;
  const visitorId = request.nextUrl.searchParams.get("visitorId");
  if (!z.string().uuid().safeParse(domainId).success || !isVisitorId(visitorId)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const room = await client.chatRoom.findFirst({
    where: { Customer: { domainId, visitorId } },
    orderBy: { createdAt: "asc" },
    select: { id: true, liveSince: true },
  });
  // `after` is the last message id the widget has: polling only returns what is new (ADR 0007).
  const after = request.nextUrl.searchParams.get("after");
  const [messages, captured] = await Promise.all([
    room ? listMessages(client, room.id, 50, z.string().uuid().safeParse(after).success ? after! : undefined) : [],
    leadCaptured(client, domainId, visitorId),
  ]);
  return NextResponse.json(
    {
      roomId: room?.id ?? null,
      live: Boolean(room?.liveSince),
      messages: messages.map(({ id, role, content }) => ({ id, role, content })),
      leadCaptured: captured,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
