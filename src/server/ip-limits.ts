import { createHmac } from "node:crypto";
import { checkLeadIpLimits, checkMessageIpLimits, IP_LIMITS, ipKey, type IpCheck, type IpLimitReason } from "@/domain/ip-limits";
import { dayKey } from "@/domain/metrics";
import type { PrismaClient } from "@/generated/prisma/client";
import { captureError, captureWarning } from "./observability";

// Limits per IP and site for the public widget endpoints (spec 015, ADR 0009). What is stored is
// an HMAC of the connection (RateLimitHit), never the IP, and a daily cron deletes it.

/** Outside production only: fingerprints made with it are not secret. */
export const DEV_RATE_LIMIT_SECRET = "brainance-dev-rate-limit-secret";
const DAY_MS = 24 * 60 * 60_000;

let warnedMissingSecret = false;
const warnedBlocked = new Set<string>();

/** The visitor's address. On Vercel the platform sets x-forwarded-for: the client cannot forge it. */
export const clientIp = (headers: Headers): string | null => {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || null;
};

export const ipFingerprint = (key: string, secret: string) => createHmac("sha256", secret).update(key).digest("base64url");

type Env = Partial<Record<"NODE_ENV" | "RATE_LIMIT_SECRET", string>>;

/**
 * RATE_LIMIT_SECRET, or a fixed one outside production. In production without it the limit fails
 * open (criterion 9): the chat keeps working and the missing secret is reported once per instance.
 */
export const rateLimitSecret = (env: Env = process.env): string | null => {
  if (env.RATE_LIMIT_SECRET) return env.RATE_LIMIT_SECRET;
  if (env.NODE_ENV !== "production") return DEV_RATE_LIMIT_SECRET;
  if (!warnedMissingSecret) {
    warnedMissingSecret = true;
    captureError(new Error("RATE_LIMIT_SECRET is missing: the widget runs without IP limits"), { area: "widget" });
  }
  return null;
};

/** The connection's fingerprint, or null when IP limits do not apply to this request. */
export const requestFingerprint = (headers: Headers, env: Env = process.env) => {
  const ip = clientIp(headers);
  const key = ip ? ipKey(ip) : null;
  if (!key) return null;
  const secret = rateLimitSecret(env);
  return secret ? ipFingerprint(key, secret) : null;
};

type Connection = { fingerprint: string; domainId: string };

/** Records a stopped request (criterion 11) and warns Sentry once per site and day (criterion 12). */
export const recordIpBlock = async (
  db: PrismaClient,
  { fingerprint, domainId, reason }: Connection & { reason: IpLimitReason },
  now = new Date(),
) => {
  await db.rateLimitHit.create({ data: { fingerprint, domainId, kind: "blocked", reason, createdAt: now } });
  const key = `${domainId}:${dayKey(now)}`;
  if (!warnedBlocked.has(key)) {
    warnedBlocked.add(key);
    captureWarning("Requests stopped by the IP limit", { area: "widget", domainId, extra: { reason } });
  }
};

const counter =
  (db: PrismaClient, { fingerprint, domainId }: Connection, now: Date) =>
  (kind: string, windowMs: number) =>
    db.rateLimitHit.count({ where: { fingerprint, domainId, kind, createdAt: { gte: new Date(now.getTime() - windowMs) } } });

/**
 * Whether a visitor message from this connection may go on (criteria 1–5). If it may, it is
 * counted, and so is the visitor when the site never saw them: check before creating the visitor.
 */
export const admitMessage = async (
  db: PrismaClient,
  { visitorId, ...connection }: Connection & { visitorId: string },
  now = new Date(),
): Promise<IpCheck> => {
  const count = counter(db, connection, now);
  const [burst, daily, newVisitors, known] = await Promise.all([
    count("message", IP_LIMITS.burst.windowMs),
    count("message", IP_LIMITS.daily.windowMs),
    count("new_visitor", IP_LIMITS.newVisitors.windowMs),
    db.customer.count({ where: { domainId: connection.domainId, visitorId } }),
  ]);
  const isNewVisitor = known === 0;
  const check = checkMessageIpLimits({ burst, daily, newVisitors, isNewVisitor });
  if (!check.ok) {
    await recordIpBlock(db, { ...connection, reason: check.reason }, now);
    return check;
  }
  await db.rateLimitHit.createMany({
    data: [
      { ...connection, kind: "message", createdAt: now },
      ...(isNewVisitor ? [{ ...connection, kind: "new_visitor", createdAt: now }] : []),
    ],
  });
  return check;
};

/** Whether a contact form from this connection may go on (criterion 6); counted if it may. */
export const admitLead = async (db: PrismaClient, connection: Connection, now = new Date()): Promise<IpCheck> => {
  const check = checkLeadIpLimits({ leads: await counter(db, connection, now)("lead", IP_LIMITS.leads.windowMs) });
  if (!check.ok) {
    await recordIpBlock(db, { ...connection, reason: check.reason }, now);
    return check;
  }
  await db.rateLimitHit.create({ data: { ...connection, kind: "lead", createdAt: now } });
  return check;
};

/** Deletes fingerprints older than a day (criterion 10). Returns how many went. */
export const purgeRateLimitHits = async (db: PrismaClient, now = new Date()) =>
  (await db.rateLimitHit.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - DAY_MS) } } })).count;
