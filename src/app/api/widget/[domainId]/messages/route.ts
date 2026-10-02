import { after, NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  checkIncomingMessage,
  isVisitorId,
  MAX_MESSAGE_LENGTH,
  recentHistory,
  SITE_DAILY_LIMIT,
  VISITOR_LIMIT,
  type RejectReason,
} from "@/domain/widget-limits";
import { client } from "@/lib/prisma";
import { streamAnswer } from "@/server/ai/answer";
import { resolveAnswerModel } from "@/server/ai/models";
import {
  addMessage,
  countSiteMessagesSince,
  countVisitorMessagesSince,
  getOrCreateRoom,
  listMessages,
} from "@/server/conversations";
import { DEFAULT_CONTACT, getWidgetSite, toBusinessKnowledge } from "@/server/widget-site";

const body = z.object({ visitorId: z.string(), text: z.string() });

const REJECTIONS: Record<Exclude<RejectReason, "site_cap">, { status: number; message: string }> = {
  empty: { status: 400, message: "Escribí tu consulta antes de enviarla." },
  too_long: { status: 400, message: `Tu mensaje es muy largo: escribilo en menos de ${MAX_MESSAGE_LENGTH} caracteres.` },
  visitor_rate: { status: 429, message: "Enviaste muchos mensajes seguidos. Esperá unos minutos y volvé a intentar." },
};

const SITE_CAP_REPLY = `En este momento no puedo responder más consultas. Podés comunicarte con el negocio por ${DEFAULT_CONTACT}.`;

export async function POST(request: NextRequest, { params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await params;
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!z.string().uuid().safeParse(domainId).success || !parsed.success || !isVisitorId(parsed.data.visitorId)) {
    return NextResponse.json({ error: "bad_request", message: "No pudimos enviar tu mensaje." }, { status: 400 });
  }
  const site = await getWidgetSite(client, domainId);
  if (!site) return NextResponse.json({ error: "not_found", message: "Este chat no está disponible." }, { status: 404 });

  const room = await getOrCreateRoom(client, { domainId, visitorId: parsed.data.visitorId });
  const now = Date.now();
  const [visitorRecent, siteDaily] = await Promise.all([
    countVisitorMessagesSince(client, room, new Date(now - VISITOR_LIMIT.windowMs)),
    countSiteMessagesSince(client, domainId, new Date(now - SITE_DAILY_LIMIT.windowMs)),
  ]);
  const check = checkIncomingMessage(parsed.data.text, { visitorRecent, siteDaily });

  if (!check.ok && check.reason !== "site_cap") {
    const { status, message } = REJECTIONS[check.reason];
    return NextResponse.json({ error: check.reason, message }, { status });
  }

  // Read the context before storing the new question, so it is not sent twice.
  const history = recentHistory(await listMessages(client, room, 20)).map(({ role, content }) => ({ role, content }));
  const question = check.ok ? check.text : parsed.data.text.trim();
  await addMessage(client, room, "user", question);

  if (!check.ok) {
    // Over the site's daily cap: answer without calling the model.
    await addMessage(client, room, "assistant", SITE_CAP_REPLY);
    return NextResponse.json({ reply: SITE_CAP_REPLY });
  }

  const answer = streamAnswer({
    business: toBusinessKnowledge(site),
    history,
    question,
    model: resolveAnswerModel(),
    onEnd: async ({ text }) => {
      if (text.trim()) await addMessage(client, room, "assistant", text);
    },
  });
  // Keep the function alive until the answer is stored, even after the response is sent.
  after(() => answer.finished.catch((error) => console.error("Widget answer failed", error)));

  return answer.toTextStreamResponse({ headers: { "Cache-Control": "no-store" } });
}
