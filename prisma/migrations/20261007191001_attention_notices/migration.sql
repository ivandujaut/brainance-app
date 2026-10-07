-- AlterTable
ALTER TABLE "ChatBot" ADD COLUMN     "attentionEmail" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "attentionAt" TIMESTAMP(3),
ADD COLUMN     "attentionNotices" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "attentionNotifiedAt" TIMESTAMP(3);
