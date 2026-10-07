-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "answersAttentionAt" TIMESTAMP(3);

-- Backfill: the owner's first message after the room's current flag answers that flag.
-- Earlier episodes were overwritten by ChatRoom."attentionAt" and cannot be recovered.
UPDATE "ChatMessage" m
SET "answersAttentionAt" = r."attentionAt"
FROM "ChatRoom" r
WHERE m."chatRoomId" = r.id
  AND r."attentionAt" IS NOT NULL
  AND m.id = (
    SELECT o.id FROM "ChatMessage" o
    WHERE o."chatRoomId" = r.id AND o.role = 'owner' AND o."createdAt" >= r."attentionAt"
    ORDER BY o."createdAt", o.id
    LIMIT 1
  );
