import { Pool } from "pg";

// Seeds E2E fixtures straight into the app's database (same DATABASE_URL as the app under test).
// Plain SQL instead of the generated Prisma client, which is ESM-only.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

type SiteOptions = { background?: string; contact?: string; leadCapture?: boolean; leadQuestion?: string };

export const createSite = async (
  name: string,
  { background = "#123456", contact, leadCapture = true, leadQuestion }: SiteOptions = {},
) => {
  const {
    rows: [user],
  } = await pool.query<{ id: string }>(
    `INSERT INTO "User" (fullname, "clerkId", email, "updatedAt") VALUES ('E2E', $1, 'duena-e2e@example.com', now()) RETURNING id`,
    [`e2e_${crypto.randomUUID()}`],
  );
  const {
    rows: [domain],
  } = await pool.query<{ id: string }>(
    `INSERT INTO "Domain" (name, icon, "userId") VALUES ($1, '', $2) RETURNING id`,
    [name, user.id],
  );
  await pool.query(
    `INSERT INTO "ChatBot" ("welcomeMessage", background, contact, "leadCapture", "domainId") VALUES ($1, $2, $3, $4, $5)`,
    ["¡Hola! Soy el asistente de prueba.", background, contact ?? null, leadCapture, domain.id],
  );
  await pool.query(`INSERT INTO "HelpDesk" (question, answer, "domainId") VALUES ($1, $2, $3)`, [
    "¿Hacen envíos?",
    "Sí, a todo el país.",
    domain.id,
  ]);
  if (leadQuestion) {
    await pool.query(`INSERT INTO "FilterQuestions" (question, "domainId") VALUES ($1, $2)`, [leadQuestion, domain.id]);
  }
  return { userId: user.id, domainId: domain.id };
};

/** Deleting the users cascades to their sites, visitors, conversations and messages. */
export const deleteUsers = async (ids: string[]) => {
  if (ids.length) await pool.query(`DELETE FROM "User" WHERE id = ANY($1::uuid[])`, [ids]);
};

export const installedAt = async (domainId: string) => {
  const { rows } = await pool.query<{ installedAt: Date | null }>(
    `SELECT "installedAt" FROM "ChatBot" WHERE "domainId" = $1`,
    [domainId],
  );
  return rows[0]?.installedAt ?? null;
};

/** Fills the site's daily quota with `count` visitor messages from another visitor. */
export const seedVisitorMessages = async (domainId: string, count: number) => {
  const {
    rows: [room],
  } = await pool.query<{ id: string }>(
    `WITH c AS (INSERT INTO "Customer" ("visitorId", "domainId") VALUES ($1, $2) RETURNING id)
     INSERT INTO "ChatRoom" ("customerId", "updatedAt") SELECT id, now() FROM c RETURNING id`,
    [crypto.randomUUID(), domainId],
  );
  await pool.query(
    `INSERT INTO "ChatMessage" (message, role, "chatRoomId", "updatedAt")
     SELECT 'consulta ' || n, 'user', $1, now() FROM generate_series(1, $2) n`,
    [room.id, count],
  );
};

/** The site's leads with their answers (spec 005). */
export const leadsOf = async (domainId: string) => {
  const { rows } = await pool.query<{ email: string; answers: string[] }>(
    `SELECT c.email, coalesce(array_agg(r.answered) FILTER (WHERE r.id IS NOT NULL), '{}') AS answers
     FROM "Customer" c LEFT JOIN "CustomerResponses" r ON r."customerId" = c.id
     WHERE c."domainId" = $1 AND c."leadAt" IS NOT NULL GROUP BY c.id`,
    [domainId],
  );
  return rows;
};

export const siteIdByName = async (name: string) => {
  const { rows } = await pool.query<{ id: string }>(`SELECT id FROM "Domain" WHERE name = $1`, [name]);
  return rows[0].id;
};

/** A visitor who already left their data on the site. */
export const seedLead = async (domainId: string, email: string, answer: { question: string; answered: string }) => {
  const {
    rows: [customer],
  } = await pool.query<{ id: string }>(
    `INSERT INTO "Customer" ("visitorId", "domainId", email, "leadAt", "consentAt") VALUES ($1, $2, $3, now(), now()) RETURNING id`,
    [crypto.randomUUID(), domainId, email],
  );
  await pool.query(`INSERT INTO "CustomerResponses" (question, answered, "customerId") VALUES ($1, $2, $3)`, [
    answer.question,
    answer.answered,
    customer.id,
  ]);
};

/** The visitor's conversation on a site (spec 006). */
export const roomOf = async (domainId: string) => {
  const { rows } = await pool.query<{ id: string }>(
    `SELECT r.id FROM "ChatRoom" r JOIN "Customer" c ON c.id = r."customerId" WHERE c."domainId" = $1 LIMIT 1`,
    [domainId],
  );
  return rows[0]?.id ?? null;
};

/** Simulates the owner taking over from the inbox and replying (same rows the inbox writes). */
export const ownerTakesOver = async (roomId: string, businessName: string) => {
  await pool.query(`UPDATE "ChatRoom" SET "liveSince" = now(), "lastMessageAt" = now() WHERE id = $1`, [roomId]);
  await pool.query(
    `INSERT INTO "ChatMessage" (message, role, "chatRoomId", seen, "updatedAt") VALUES ($1, 'system', $2, true, now())`,
    [`Ahora te atiende una persona de ${businessName}.`, roomId],
  );
};

export const ownerSays = async (roomId: string, text: string) => {
  await pool.query(`INSERT INTO "ChatMessage" (message, role, "chatRoomId", "updatedAt") VALUES ($1, 'owner', $2, now())`, [
    text,
    roomId,
  ]);
};

export const messagesOf = async (roomId: string) => {
  const { rows } = await pool.query<{ role: string; message: string }>(
    `SELECT role, message FROM "ChatMessage" WHERE "chatRoomId" = $1 ORDER BY "createdAt", id`,
    [roomId],
  );
  return rows.map((r) => `${r.role}:${r.message}`);
};

/** A visitor conversation the bot could not answer, as the inbox would receive it. */
export const seedConversation = async (domainId: string) => {
  const {
    rows: [room],
  } = await pool.query<{ id: string }>(
    `WITH c AS (INSERT INTO "Customer" ("visitorId", "domainId") VALUES ($1, $2) RETURNING id)
     INSERT INTO "ChatRoom" ("customerId", "updatedAt", "lastMessageAt", "needsAttention", "attentionReason")
     SELECT id, now(), now(), true, 'derivation' FROM c RETURNING id`,
    [crypto.randomUUID(), domainId],
  );
  await pool.query(
    `INSERT INTO "ChatMessage" (message, role, "chatRoomId", "updatedAt", "createdAt") VALUES
     ('¿Tienen sin TACC?', 'user', $1, now(), now() - interval '2 seconds'),
     ('No tengo ese dato. Escribinos por WhatsApp.', 'assistant', $1, now(), now() - interval '1 second')`,
    [room.id],
  );
  return room.id;
};

/** Spends the site's daily AI budget (spec 007): one recorded call of `costUsd`. */
export const seedModelSpend = async (domainId: string, costUsd: number) => {
  await pool.query(
    `INSERT INTO "ModelCall" ("domainId", purpose, "requestedModel", "latencyMs", "costUsd") VALUES ($1, 'answer', 'anthropic/claude-haiku-4.5', 900, $2)`,
    [domainId, costUsd],
  );
};

export const modelCallsOf = async (domainId: string) => {
  const { rows } = await pool.query<{ requestedModel: string; costUsd: string | null }>(
    `SELECT "requestedModel", "costUsd" FROM "ModelCall" WHERE "domainId" = $1 ORDER BY "createdAt"`,
    [domainId],
  );
  return rows;
};

/** Completes the onboarding of a site created from the UI: three FAQs and the bot installed. */
export const completeOnboarding = async (domainId: string) => {
  for (const n of [1, 2, 3]) {
    await pool.query(`INSERT INTO "HelpDesk" (question, answer, "domainId") VALUES ($1, $2, $3)`, [`¿Pregunta ${n}?`, `Respuesta ${n}.`, domainId]);
  }
  await pool.query(`UPDATE "ChatBot" SET "installedAt" = now() WHERE "domainId" = $1`, [domainId]);
};

/** Owner notices sent for the site's conversations (spec 010): one row per room, newest first. */
export const attentionNoticesOf = async (domainId: string) => {
  const { rows } = await pool.query<{ reason: string | null; notified: boolean; notices: number }>(
    `SELECT r."attentionReason" AS reason, r."attentionNotifiedAt" IS NOT NULL AS notified, r."attentionNotices" AS notices
     FROM "ChatRoom" r JOIN "Customer" c ON c.id = r."customerId"
     WHERE c."domainId" = $1 ORDER BY r."createdAt" DESC`,
    [domainId],
  );
  return rows;
};
