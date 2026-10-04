import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { client } from "@/lib/prisma";
import { authorizeVisitorChannel, getRealtime } from "@/server/realtime";

// Spec 006 / ADR 0007: a visitor may only listen to their own conversation's channel. Pusher posts
// socket_id and channel_name as a form; the widget adds its secret visitorId.
export async function POST(request: NextRequest, { params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await params;
  const form = await request.formData().catch(() => null);
  const auth = await authorizeVisitorChannel(
    getRealtime(),
    {
      socketId: String(form?.get("socket_id") ?? ""),
      channel: String(form?.get("channel_name") ?? ""),
      visitorId: form?.get("visitorId"),
    },
    async (roomId) => {
      if (!z.string().uuid().safeParse(roomId).success || !z.string().uuid().safeParse(domainId).success) return null;
      const room = await client.chatRoom.findFirst({
        where: { id: roomId, Customer: { domainId } },
        select: { Customer: { select: { visitorId: true } } },
      });
      return room?.Customer?.visitorId ?? null;
    },
  );
  return auth ? NextResponse.json(auth) : NextResponse.json({ error: "forbidden" }, { status: 403 });
}
