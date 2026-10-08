-- CreateTable
CREATE TABLE "RateLimitHit" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fingerprint" TEXT NOT NULL,
    "domainId" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "RateLimitHit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateLimitHit_fingerprint_domainId_kind_createdAt_idx" ON "RateLimitHit"("fingerprint", "domainId", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "RateLimitHit_domainId_kind_createdAt_idx" ON "RateLimitHit"("domainId", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "RateLimitHit_createdAt_idx" ON "RateLimitHit"("createdAt");
