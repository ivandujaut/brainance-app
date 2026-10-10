import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// ADR 0011: icons are uploaded through the server, and the actions that save one only take a URL
// that upload produced.
const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;

const OWNER = "user_int_icons";
let signedIn = true;
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: async () => (signedIn ? { id: OWNER } : null),
  clerkClient: async () => ({}),
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

const STORED = "https://abc123xyz.public.blob.vercel-storage.com/icons/icon-Xy9aBc.png";

describe.skipIf(!url)("icon actions", async () => {
  const { client: db } = await import("@/lib/prisma");
  const settings = await import("./index");
  const { onUploadIcon } = await import("./icon");

  beforeEach(async () => {
    signedIn = true;
    await db.user.deleteMany({ where: { clerkId: OWNER } });
    await db.user.create({ data: { clerkId: OWNER, fullname: "Dueña", subscription: { create: {} } } });
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { clerkId: OWNER } });
    await db.$disconnect();
  });

  const sites = () => db.domain.findMany({ where: { User: { clerkId: OWNER } }, select: { icon: true } });

  it("onIntegrateDomain: saves an uploaded icon URL", async () => {
    expect((await settings.onIntegrateDomain("iconos.com.ar", STORED))?.status).toBe(200);
    expect(await sites()).toEqual([{ icon: STORED }]);
  });

  it("onIntegrateDomain: rejects an icon from anywhere else", async () => {
    for (const icon of ["https://evil.example.com/icons/x.png", "8d3c1f9e-0a6b-4a8e-9c1a-2f7f6b0e5d41"]) {
      expect((await settings.onIntegrateDomain("iconos.com.ar", icon))?.status).toBe(400);
    }
    expect(await sites()).toEqual([]);
  });

  it("onUploadIcon: needs a session and an image", async () => {
    const form = new FormData();
    form.append("file", new File(["<svg/>"], "logo.png", { type: "image/png" }));
    expect(await onUploadIcon(form)).toEqual({ error: "El ícono tiene que ser PNG o JPG de hasta 2 MB." });

    signedIn = false;
    expect(await onUploadIcon(form)).toEqual({ error: "Volvé a ingresar para subir el ícono." });
  });
});
