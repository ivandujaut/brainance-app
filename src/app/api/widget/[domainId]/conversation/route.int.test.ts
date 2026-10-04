import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Spec 006, criterion 17: polling only returns a conversation to the visitor who owns it.
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

describe.skipIf(!url)("widget conversation polling", async () => {
  const { client: db } = await import("@/lib/prisma");
  const { GET } = await import("./route");
  const { POST: authorize } = await import("../realtime/auth/route");
  const clerkId = "user_int_widget_poll";
  const visitor = crypto.randomUUID();
  let domainId: string;
  let firstId: string;

  beforeAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    const user = await db.user.create({
      data: {
        clerkId,
        fullname: "Dueña",
        domains: {
          create: {
            name: "poll-int.com.ar",
            icon: "",
            customer: {
              create: {
                visitorId: visitor,
                chatRoom: {
                  create: {
                    liveSince: new Date(),
                    message: {
                      create: [
                        { role: "user", message: "hola", createdAt: new Date(Date.now() - 2000) },
                        { role: "owner", message: "¡Hola! Soy Laura.", createdAt: new Date(Date.now() - 1000) },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      include: { domains: { include: { customer: { include: { chatRoom: { include: { message: { orderBy: { createdAt: "asc" } } } } } } } } },
    });
    domainId = user.domains[0].id;
    firstId = user.domains[0].customer[0].chatRoom[0].message[0].id;
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId } });
    await db.$disconnect();
  });

  const get = async (visitorId: string, after?: string) => {
    const query = new URLSearchParams({ visitorId, ...(after && { after }) });
    const res = await GET(new NextRequest(`http://localhost/api/widget/${domainId}/conversation?${query}`), {
      params: Promise.resolve({ domainId }),
    });
    return res.json();
  };

  it("returns the visitor's messages with their roles and whether a person attends", async () => {
    const data = await get(visitor);
    expect(data.live).toBe(true);
    expect(data.messages.map((m: { role: string }) => m.role)).toEqual(["user", "owner"]);
  });

  it("returns only what is new after a cursor", async () => {
    const data = await get(visitor, firstId);
    expect(data.messages.map((m: { content: string }) => m.content)).toEqual(["¡Hola! Soy Laura."]);
  });

  it("returns nothing to another visitor, even with a valid cursor", async () => {
    const data = await get(crypto.randomUUID(), firstId);
    expect(data).toMatchObject({ roomId: null, live: false, messages: [] });
  });

  it("refuses channel authorization when push is not configured", async () => {
    const form = new FormData();
    form.set("socket_id", "1.2");
    form.set("channel_name", "private-room-x");
    form.set("visitorId", visitor);
    const res = await authorize(new NextRequest("http://localhost/x", { method: "POST", body: form }), {
      params: Promise.resolve({ domainId }),
    });
    expect(res.status).toBe(403);
  });
});
