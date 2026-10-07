import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { debugRoutesEnabled } from "@/domain/debug-routes";
import { captureError } from "@/server/observability";

export const dynamic = "force-dynamic";

/**
 * Sends a test error to Sentry so a preview can be checked end to end (docs/lanzamiento.md, step 5).
 * Previews and local only, and behind sign-in (not a public route in src/proxy.ts). The fake email and
 * text must arrive as [redacted]: that is the scrubber working (ADR 0008).
 */
export const GET = async () => {
  if (!debugRoutesEnabled(process.env)) return new NextResponse(null, { status: 404 });

  captureError(new Error("Prueba de Sentry (BrAInance): error enviado a propósito"), {
    area: "debug",
    extra: { probe: true, email: "visitante@example.com", text: "Texto de una conversación que no debe llegar" },
  });
  // Serverless functions can freeze right after responding: send the event before that.
  const sent = Sentry.isInitialized() && (await Sentry.flush(2000));

  return NextResponse.json(
    {
      sent,
      next: sent
        ? "Buscá en Sentry el issue 'Prueba de Sentry'. En Additional Data, email y text tienen que decir [redacted]."
        : "Sentry no está activo en este deploy: falta SENTRY_DSN.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
};
