import { Pool } from "pg";

// Seeds E2E fixtures straight into the app's database (same DATABASE_URL as the app under test).
// Plain SQL instead of the generated Prisma client, which is ESM-only.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

type SiteOptions = { background?: string; contact?: string };

export const createSite = async (name: string, { background = "#123456", contact }: SiteOptions = {}) => {
  const {
    rows: [user],
  } = await pool.query<{ id: string }>(
    `INSERT INTO "User" (fullname, "clerkId", "updatedAt") VALUES ('E2E', $1, now()) RETURNING id`,
    [`e2e_${crypto.randomUUID()}`],
  );
  const {
    rows: [domain],
  } = await pool.query<{ id: string }>(
    `INSERT INTO "Domain" (name, icon, "userId") VALUES ($1, '', $2) RETURNING id`,
    [name, user.id],
  );
  await pool.query(
    `INSERT INTO "ChatBot" ("welcomeMessage", background, contact, "domainId") VALUES ($1, $2, $3, $4)`,
    ["¡Hola! Soy el asistente de prueba.", background, contact ?? null, domain.id],
  );
  await pool.query(`INSERT INTO "HelpDesk" (question, answer, "domainId") VALUES ($1, $2, $3)`, [
    "¿Hacen envíos?",
    "Sí, a todo el país.",
    domain.id,
  ]);
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
