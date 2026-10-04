-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'owner';
ALTER TYPE "Role" ADD VALUE 'system';

-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "attentionReason" TEXT,
ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "liveSince" TIMESTAMP(3),
ADD COLUMN     "needsAttention" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ChatMessage_chatRoomId_seen_idx" ON "ChatMessage"("chatRoomId", "seen");

-- CreateIndex
CREATE INDEX "ChatRoom_lastMessageAt_idx" ON "ChatRoom"("lastMessageAt");


-- Backfill: order existing conversations by their latest message.
UPDATE "ChatRoom" r SET "lastMessageAt" = m.latest
FROM (SELECT "chatRoomId", max("createdAt") AS latest FROM "ChatMessage" GROUP BY "chatRoomId") m
WHERE m."chatRoomId" = r.id;
