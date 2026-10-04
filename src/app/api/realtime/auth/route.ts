import { currentUser } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { client } from "@/lib/prisma";
import { authorizeOwnerChannel, getRealtime } from "@/server/realtime";

// Spec 006 / ADR 0007: an owner may only listen to their own inbox channel.
export async function POST(request: NextRequest) {
  const clerkUser = await currentUser();
  const form = await request.formData().catch(() => null);
  const user = clerkUser
    ? await client.user.findUnique({ where: { clerkId: clerkUser.id }, select: { id: true } })
    : null;
  const auth = user
    ? authorizeOwnerChannel(getRealtime(), {
        socketId: String(form?.get("socket_id") ?? ""),
        channel: String(form?.get("channel_name") ?? ""),
        userId: user.id,
      })
    : null;
  return auth ? NextResponse.json(auth) : NextResponse.json({ error: "forbidden" }, { status: 403 });
}
