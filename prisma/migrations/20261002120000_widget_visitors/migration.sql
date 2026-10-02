-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "visitorId" TEXT;

-- CreateIndex
CREATE INDEX "ChatMessage_chatRoomId_createdAt_idx" ON "ChatMessage"("chatRoomId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_domainId_visitorId_key" ON "Customer"("domainId", "visitorId");

