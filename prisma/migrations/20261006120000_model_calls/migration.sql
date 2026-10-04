-- CreateTable
CREATE TABLE "ModelCall" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "domainId" UUID NOT NULL,
    "chatRoomId" UUID,
    "purpose" TEXT NOT NULL,
    "requestedModel" TEXT NOT NULL,
    "servedModel" TEXT,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "cacheReadTokens" INTEGER NOT NULL DEFAULT 0,
    "cacheWriteTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(12,6),
    "latencyMs" INTEGER NOT NULL,
    "finishReason" TEXT,
    "error" TEXT,

    CONSTRAINT "ModelCall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModelCall_domainId_createdAt_idx" ON "ModelCall"("domainId", "createdAt");

-- CreateIndex
CREATE INDEX "ModelCall_createdAt_idx" ON "ModelCall"("createdAt");

-- AddForeignKey
ALTER TABLE "ModelCall" ADD CONSTRAINT "ModelCall_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

