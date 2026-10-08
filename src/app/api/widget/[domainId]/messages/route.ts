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
import { effectiveAnswerCap } from "@/domain/answer-cap";
import { ipDailyReply } from "@/domain/fallback-reply";
import type { IpLimitReason } from "@/domain/ip-limits";
import { getAppUrl } from "@/lib/app-url";
import { client } from "@/lib/prisma";
import { streamAnswer } from "@/server/ai/answer";
import { answerModelId, resolveAnswerModel } from "@/server/ai/models";
import { recordModelCall, siteCostState } from "@/server/ai/usage";
import { dailyCostCapUsd } from "@/domain/cost-cap";
import { captureError } from "@/server/observability";
import {
  addMessage,
  countSiteAnswersSince,
  countVisitorMessagesSince,
  getOrCreateRoom,
  listMessages,
  markDerivation,
} from "@/server/conversations";
import { detectAttention, type AttentionReason } from "@/domain/attention";
import { toModelHistory } from "@/domain/takeover";
import { resolveEmailSender } from "@/server/email";
import { flagAttention, resolveVisitorTurn, type FlagResult } from "@/server/live";
import { ownerEmail } from "@/server/owner-email";
import { admitMessage, requestFingerprint } from "@/server/ip-limits";
import { notifyAttention } from "@/server/owner-notices";
import { notifyRoomChanged } from "@/server/realtime";
import {
  getWidgetSite,
  siteCapReply,
  siteFallbackReply,
  toBusinessKnowledge,
  type WidgetSite,
} from "@/server/widget-site";

const body = z.object({ visitorId: z.string(), text: z.string() });

const REJECTIONS: Record<Exclude<RejectReason, "site_cap">, { status: number; message: string }> = {
  empty: { status: 400, message: "Escribí tu consulta antes de enviarla." },
  too_long: { status: 400, message: `Tu mensaje es muy largo: escribilo en menos de ${MAX_MESSAGE_LENGTH} caracteres.` },
  visitor_rate: { status: 429, message: "Enviaste muchos mensajes seguidos. Esperá unos minutos y volvé a intentar." },
};

// Spec 015: what a connection over its limits reads.
const IP_BURST_MESSAGE = "Se enviaron muchos mensajes desde tu conexión. Esperá unos minutos y volvé a intentar.";
const ipRejection = (reason: IpLimitReason, site: WidgetSite) =>
  reason === "ip_daily" ? ipDailyReply(toBusinessKnowledge(site)) : IP_BURST_MESSAGE;

export async function POST(request: NextRequest, { params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await params;
  // Spec 010: the owner hears about it by email, after the visitor got their answer.
  const notifyOwner = (room: string, reason: AttentionReason, flagged: FlagResult) =>
    notifyAttention(
      client,
      { roomId: room, domainId, reason, flagged, now: new Date() },
      { sender: resolveEmailSender(), ownerEmail, appUrl: getAppUrl() },
    );
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!z.string().uuid().safeParse(domainId).success || !parsed.success || !isVisitorId(parsed.data.visitorId)) {
    return NextResponse.json({ error: "bad_request", message: "No pudimos enviar tu mensaje." }, { status: 400 });
  }
  const site = await getWidgetSite(client, domainId);
  if (!site) return NextResponse.json({ error: "not_found", message: "Este chat no está disponible." }, { status: 404 });

  // Spec 015: limits per IP and site, before anything is stored (not even a new visitor).
  const fingerprint = requestFingerprint(request.headers);
  if (fingerprint) {
    const ip = await admitMessage(client, { fingerprint, domainId, visitorId: parsed.data.visitorId });
    if (!ip.ok) return NextResponse.json({ error: ip.reason, message: ipRejection(ip.reason, site) }, { status: 429 });
  }

  const room = await getOrCreateRoom(client, { domainId, visitorId: parsed.data.visitorId });
  // Spec 006: while a person attends the conversation, the bot stays quiet.
  const turn = await resolveVisitorTurn(client, room);
  const now = Date.now();
  const [visitorRecent, siteDaily] = await Promise.all([
    countVisitorMessagesSince(client, room, new Date(now - VISITOR_LIMIT.windowMs)),
    // The site's daily cap only protects the model's cost: it does not apply to a person's conversation.
    turn === "owner" ? 0 : countSiteAnswersSince(client, domainId, new Date(now - SITE_DAILY_LIMIT.windowMs)),
  ]);
  // Spec 011, criterion 9: the owner's cap, when lower than the beta maximum.
  const siteCap = effectiveAnswerCap(site.chatBot?.dailyAnswerCap);
  const check = checkIncomingMessage(parsed.data.text, { visitorRecent, siteDaily, siteCap });

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
    await addMessage(client, room, "assistant", reply, { derivation: true });
    const flagged = await flagAttention(client, room, "site_cap");
    after(() => Promise.all([notifyRoomChanged(client, room), notifyOwner(room, "site_cap", flagged)]));
    return NextResponse.json({ reply });
  }

  const answer = streamAnswer({
    business: toBusinessKnowledge(site),
    history,
    question,
    model: resolveAnswerModel(),
    // Spec 014: if the model fails, times out or answers nothing, the visitor gets the contact.
    fallbackText: siteFallbackReply(site),
    onSettled: (report) =>
      recordModelCall(client, { domainId, chatRoomId: room, purpose: "answer", requestedModel: answerModelId(), report }),
    onEnd: async ({ text, fallback }) => {
      if (fallback) {
        // What the visitor saw, stored as a derivation (spec 014, criterion 7).
        await addMessage(client, room, "assistant", text, { derivation: true, fallback: true });
        const flagged = await flagAttention(client, room, "model_error");
        await notifyRoomChanged(client, room);
        await notifyOwner(room, "model_error", flagged);
        return;
      }
      const answerId = await addMessage(client, room, "assistant", text);
      const reason = detectAttention({ visitorText: question, reply: text, contact: site.chatBot?.contact ?? null });
      if (reason) {
        // Spec 011, criterion 2: the answer that derived counts as such, not the whole conversation.
        if (reason === "derivation") await markDerivation(client, answerId);
        const flagged = await flagAttention(client, room, reason);
        await notifyRoomChanged(client, room);
        await notifyOwner(room, reason, flagged);
      } else {
        await notifyRoomChanged(client, room);
      }
    },
  });
  // Keep the function alive until the answer is stored, even after the response is sent.
  after(() => answer.finished.catch((error) => captureError(error, { area: "widget", domainId })));

  return answer.toTextStreamResponse({ headers: { "Cache-Control": "no-store" } });
}
