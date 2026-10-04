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
import { answerModelId, resolveAnswerModel } from "@/server/ai/models";
import { recordModelCall, siteCostState } from "@/server/ai/usage";
import { dailyCostCapUsd } from "@/domain/cost-cap";
import { captureError } from "@/server/observability";
import {
  addMessage,
  countSiteMessagesSince,
  countVisitorMessagesSince,
  getOrCreateRoom,
  listMessages,
} from "@/server/conversations";
import { detectAttention } from "@/domain/attention";
import { toModelHistory } from "@/domain/takeover";
import { flagAttention, resolveVisitorTurn } from "@/server/live";
import { notifyRoomChanged } from "@/server/realtime";
import { getWidgetSite, siteCapReply, toBusinessKnowledge } from "@/server/widget-site";

const body = z.object({ visitorId: z.string(), text: z.string() });

const REJECTIONS: Record<Exclude<RejectReason, "site_cap">, { status: number; message: string }> = {
  empty: { status: 400, message: "Escribí tu consulta antes de enviarla." },
  too_long: { status: 400, message: `Tu mensaje es muy largo: escribilo en menos de ${MAX_MESSAGE_LENGTH} caracteres.` },
  visitor_rate: { status: 429, message: "Enviaste muchos mensajes seguidos. Esperá unos minutos y volvé a intentar." },
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await params;
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!z.string().uuid().safeParse(domainId).success || !parsed.success || !isVisitorId(parsed.data.visitorId)) {
    return NextResponse.json({ error: "bad_request", message: "No pudimos enviar tu mensaje." }, { status: 400 });
  }
  const site = await getWidgetSite(client, domainId);
  if (!site) return NextResponse.json({ error: "not_found", message: "Este chat no está disponible." }, { status: 404 });

  const room = await getOrCreateRoom(client, { domainId, visitorId: parsed.data.visitorId });
  // Spec 006: while a person attends the conversation, the bot stays quiet.
  const turn = await resolveVisitorTurn(client, room);
  const now = Date.now();
  const [visitorRecent, siteDaily] = await Promise.all([
    countVisitorMessagesSince(client, room, new Date(now - VISITOR_LIMIT.windowMs)),
    // The site's daily cap only protects the model's cost: it does not apply to a person's conversation.
    turn === "owner" ? 0 : countSiteMessagesSince(client, domainId, new Date(now - SITE_DAILY_LIMIT.windowMs)),
  ]);
  const check = checkIncomingMessage(parsed.data.text, { visitorRecent, siteDaily });

  if (!check.ok && check.reason !== "site_cap") {
    const { status, message } = REJECTIONS[check.reason];
    return NextResponse.json({ error: check.reason, message }, { status });
  }

  if (turn === "owner" && check.ok) {
    const id = await addMessage(client, room, "user", check.text);
    after(() => notifyRoomChanged(client, room));
    return NextResponse.json({ live: true, id }, { headers: { "Cache-Control": "no-store" } });
  }

  // Read the context before storing the new question, so it is not sent twice.
  const history = recentHistory(toModelHistory(await listMessages(client, room, 20)));
  const question = check.ok ? check.text : parsed.data.text.trim();
  await addMessage(client, room, "user", question);

  // Spec 007: over the site's daily AI cost cap, the model is not called either.
  const overCost = check.ok && (await siteCostState(client, domainId, dailyCostCapUsd(process.env.AI_SITE_DAILY_COST_USD))) === "blocked";

  if (!check.ok || overCost) {
    // Over the site's daily cap (messages or cost): answer without calling the model.
    const reply = siteCapReply(site);
    await addMessage(client, room, "assistant", reply);
    await flagAttention(client, room, "site_cap");
    after(() => notifyRoomChanged(client, room));
    return NextResponse.json({ reply });
  }

  const answer = streamAnswer({
    business: toBusinessKnowledge(site),
    history,
    question,
    model: resolveAnswerModel(),
    onSettled: (report) =>
      recordModelCall(client, { domainId, chatRoomId: room, purpose: "answer", requestedModel: answerModelId(), report }),
    onEnd: async ({ text }) => {
      if (text.trim()) await addMessage(client, room, "assistant", text);
      const reason = detectAttention({ visitorText: question, reply: text, contact: site.chatBot?.contact ?? null });
      if (reason) await flagAttention(client, room, reason);
      await notifyRoomChanged(client, room);
    },
  });
  // Keep the function alive until the answer is stored, even after the response is sent.
  after(() => answer.finished.catch((error) => captureError(error, { area: "widget", domainId })));

  return answer.toTextStreamResponse({ headers: { "Cache-Control": "no-store" } });
}
