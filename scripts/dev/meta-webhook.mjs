#!/usr/bin/env node
// Captures WhatsApp Cloud API webhooks from Meta's test number, for the manual test in
// docs/whatsapp-os/prueba-webhook-meta.md (ADR 0101, "Antes de aceptar"; ADR 0102). Local only:
// every event is saved raw in capturas-meta/ (git-ignored), with the owner's own test messages.
//
//   npm run webhook:meta -- [--port 3333] [--out capturas-meta] [--fail 3] [--download]
//   npm run webhook:meta -- --subscribe WABA_ID
//
//   --fail N            answers 500 to the next N events, to watch Meta retry (ADR 0102, rule 7)
//   --download          downloads each file right away and asks for the same URL again 6 minutes later
//   --subscribe WABA_ID subscribes this app to the WhatsApp account and exits: Meta sends real
//                       messages only to subscribed apps, while the panel's test reaches any app
//
// Reads META_VERIFY_TOKEN, META_APP_SECRET and, for --download and --subscribe, META_ACCESS_TOKEN
// (optionally META_GRAPH_VERSION) from the environment or from .env.local. No dependencies: Node 20 or later.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const MEDIA_TYPES = ["audio", "image", "video", "document", "sticker"];
const URL_EXPIRY_CHECK_MS = 6 * 60_000;

/** Whether X-Hub-Signature-256 is the HMAC-SHA256 of the raw body with the app secret. */
export function signatureMatches(rawBody, header, appSecret) {
  if (!appSecret || typeof header !== "string" || !header.startsWith("sha256=")) return false;
  const given = Buffer.from(header.slice("sha256=".length), "hex");
  const expected = createHmac("sha256", appSecret).update(rawBody).digest();
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** The challenge to echo when Meta verifies the webhook with the right token, or null. */
export function verificationChallenge(searchParams, verifyToken) {
  if (!verifyToken) return null;
  const subscribes = searchParams.get("hub.mode") === "subscribe";
  return subscribes && searchParams.get("hub.verify_token") === verifyToken ? searchParams.get("hub.challenge") : null;
}

const changesOf = (body) => (body?.entry ?? []).flatMap((entry) => entry.changes ?? []);
const lastDigits = (phone) => (phone ? `…${String(phone).slice(-4)}` : "?");
// With a username the number can be missing: only the business-scoped user id (BSUID) arrives.
const sender = (m) => (m.from || !m.from_user_id ? lastDigits(m.from) : `usuario ${lastDigits(m.from_user_id)}`);

/** A short, stable stand-in for a WhatsApp id: a wamid carries the sender's number inside, in base64. */
export function shortId(id) {
  return `#${createHash("sha256").update(String(id)).digest("hex").slice(0, 6)}`;
}

/** One line per message or status in a webhook body: what arrived, without the number, the ids or the text. */
export function describeEvent(body) {
  const lines = [];
  for (const change of changesOf(body)) {
    const value = change.value ?? {};
    for (const m of value.messages ?? []) {
      const parts = [`mensaje ${m.type}`, `de ${sender(m)}`, shortId(m.id)];
      if (m.type === "text") parts.push(`${m.text?.body?.length ?? 0} caracteres`);
      if (MEDIA_TYPES.includes(m.type)) {
        const media = m[m.type] ?? {};
        parts.push(media.mime_type ?? "sin formato");
        if (media.voice) parts.push("nota de voz");
        if (media.caption) parts.push("con texto");
      }
      if (m.type === "unsupported") parts.push(m.unsupported?.type ?? "sin tipo");
      if (m.type === "reaction") parts.push(`reacción ${m.reaction?.emoji || "quitada"} a ${shortId(m.reaction?.message_id)}`);
      if (m.context?.id) parts.push(`responde a ${shortId(m.context.id)}`);
      if (m.context?.forwarded || m.context?.frequently_forwarded) parts.push("reenviado");
      lines.push(parts.join(" · "));
    }
    for (const s of value.statuses ?? []) lines.push(`estado ${s.status} · ${shortId(s.id)}`);
    if (!value.messages && !value.statuses) lines.push(`cambio ${change.field ?? "sin campo"} sin mensajes ni estados`);
  }
  return lines;
}

/** The files in a webhook body, to download right away: Meta's URL lasts 5 minutes. */
export function mediaToDownload(body) {
  return changesOf(body)
    .flatMap((change) => change.value?.messages ?? [])
    .filter((m) => MEDIA_TYPES.includes(m.type) && m[m.type]?.id)
    .map((m) => ({ messageId: m.id, type: m.type, mediaId: m[m.type].id }));
}

// --- server (manual use; not covered by tests) ------------------------------------------------

const log = (text) => console.log(`${new Date().toLocaleTimeString("es-AR", { hour12: false })}  ${text}`);

function parseArgs(argv) {
  const opts = { port: 3333, out: "capturas-meta", fail: 0, download: false, subscribe: null };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === "--download") opts.download = true;
    else if (flag === "--port") opts.port = Number(argv[++i]);
    else if (flag === "--fail") opts.fail = Number(argv[++i]);
    else if (flag === "--out") opts.out = argv[++i];
    else if (flag === "--subscribe") opts.subscribe = argv[++i] ?? "";
    else throw new Error(`Opción desconocida: ${flag}`);
  }
  const badSubscribe = opts.subscribe !== null && !/^\d+$/.test(opts.subscribe);
  if (!Number.isInteger(opts.port) || !Number.isInteger(opts.fail) || opts.fail < 0 || !opts.out || badSubscribe) {
    throw new Error(
      "Uso: npm run webhook:meta -- [--port 3333] [--out capturas-meta] [--fail N] [--download] | --subscribe WABA_ID",
    );
  }
  return opts;
}

async function subscribe(wabaId, { token, version }) {
  const url = `https://graph.facebook.com${version ? `/${version}` : ""}/${wabaId}/subscribed_apps`;
  const headers = { Authorization: `Bearer ${token}` };
  const done = await fetch(url, { method: "POST", headers });
  if (!done.ok) {
    console.error(`Meta no aceptó la suscripción (${done.status}): ${JSON.stringify(await done.json().catch(() => ({})))}`);
    process.exit(1);
  }
  const { data = [] } = await (await fetch(url, { headers })).json();
  console.log(`Apps suscriptas a la cuenta ${wabaId}: ${data.map((app) => app.whatsapp_business_api_data?.name).join(", ")}`);
}

const EXTENSIONS = { ogg: ".ogg", mpeg: ".mp3", mp4: ".mp4", jpeg: ".jpg", png: ".png", webp: ".webp", pdf: ".pdf" };
const extensionOf = (mimeType = "") => EXTENSIONS[mimeType.split(";")[0].split("/")[1]] ?? ".bin";

async function download({ messageId, type, mediaId }, { token, version, out }) {
  const headers = { Authorization: `Bearer ${token}`, "User-Agent": "brainance-prueba-webhook" };
  const record = (data) => appendFileSync(join(out, "medios.jsonl"), `${JSON.stringify({ mediaId, messageId, type, ...data })}\n`);
  const started = Date.now();
  try {
    const metadata = await fetch(`https://graph.facebook.com${version ? `/${version}` : ""}/${mediaId}`, { headers });
    if (!metadata.ok) {
      record({ paso: "datos del archivo", estado: metadata.status });
      return log(`  no pude pedir los datos del archivo ${mediaId}: ${metadata.status}`);
    }
    const info = await metadata.json();
    const file = await fetch(info.url, { headers });
    const bytes = file.ok ? Buffer.from(await file.arrayBuffer()) : null;
    if (bytes) writeFileSync(join(out, `${mediaId}${extensionOf(info.mime_type)}`), bytes);
    const ms = Date.now() - started;
    record({ formato: info.mime_type, tamano: info.file_size, primerIntento: { estado: file.status, bytes: bytes?.length ?? 0, ms } });
    log(`  archivo ${type}: ${file.status}, ${bytes?.length ?? 0} bytes en ${ms} ms`);
    setTimeout(async () => {
      const again = await fetch(info.url, { headers }).catch((error) => ({ status: `error ${error.message}` }));
      record({ aLos6Minutos: { estado: again.status } });
      log(`  la misma URL del archivo ${mediaId}, a los 6 minutos: ${again.status}`);
    }, URL_EXPIRY_CHECK_MS);
  } catch (error) {
    record({ error: error.message });
    log(`  no pude bajar el archivo ${mediaId}: ${error.message}`);
  }
}

function main() {
  try {
    process.loadEnvFile?.(".env.local");
  } catch {
    // No .env.local: the variables come from the environment.
  }
  const opts = parseArgs(process.argv.slice(2));
  const { META_VERIFY_TOKEN: verifyToken, META_APP_SECRET: appSecret, META_ACCESS_TOKEN: token } = process.env;
  if (opts.subscribe !== null) {
    if (!token) {
      console.error("--subscribe necesita META_ACCESS_TOKEN.");
      process.exit(1);
    }
    return void subscribe(opts.subscribe, { token, version: process.env.META_GRAPH_VERSION });
  }
  if (!verifyToken || !appSecret) {
    console.error("Faltan META_VERIFY_TOKEN y META_APP_SECRET (ver docs/whatsapp-os/prueba-webhook-meta.md).");
    process.exit(1);
  }
  if (opts.download && !token) {
    console.error("--download necesita META_ACCESS_TOKEN.");
    process.exit(1);
  }
  mkdirSync(opts.out, { recursive: true });
  let failLeft = opts.fail;
  let count = 0;

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname !== "/webhook") return res.writeHead(404).end();
    if (req.method === "GET") {
      const challenge = verificationChallenge(url.searchParams, verifyToken);
      log(challenge ? "verificación ok" : "verificación rechazada: el token no coincide con META_VERIFY_TOKEN");
      return challenge ? res.writeHead(200, { "Content-Type": "text/plain" }).end(challenge) : res.writeHead(403).end();
    }
    if (req.method !== "POST") return res.writeHead(405).end();

    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks);
      const signatureOk = signatureMatches(raw, req.headers["x-hub-signature-256"], appSecret);
      let body = null;
      try {
        body = JSON.parse(raw.toString("utf8"));
      } catch {
        // Saved as text below.
      }
      const status = !signatureOk ? 401 : failLeft > 0 ? 500 : 200;
      if (status === 500) failLeft -= 1;
      count += 1;
      const file = join(opts.out, `${new Date().toISOString().replace(/[:.]/g, "-")}-${String(count).padStart(3, "0")}.json`);
      writeFileSync(
        file,
        JSON.stringify(
          {
            recibido: new Date().toISOString(),
            firmaValida: signatureOk,
            respuesta: status,
            encabezados: {
              "x-hub-signature-256": req.headers["x-hub-signature-256"] ?? null,
              "user-agent": req.headers["user-agent"] ?? null,
            },
            cuerpo: body ?? raw.toString("utf8"),
          },
          null,
          2,
        ),
      );
      res.writeHead(status).end();
      const why = status === 500 ? ` a propósito (quedan ${failLeft})` : "";
      log(`${signatureOk ? "firma ok" : "FIRMA INVÁLIDA: revisá META_APP_SECRET"} · respondí ${status}${why} · ${file}`);
      for (const line of describeEvent(body)) log(`  ${line}`);
      if (opts.download && status === 200) {
        for (const item of mediaToDownload(body)) {
          void download(item, { token, version: process.env.META_GRAPH_VERSION, out: opts.out });
        }
      }
    });
  });
  server.listen(opts.port, () => log(`Escuchando en http://localhost:${opts.port}/webhook · capturas en ${opts.out}/`));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
