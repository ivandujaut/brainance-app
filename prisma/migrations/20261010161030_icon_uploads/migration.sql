-- CreateTable
CREATE TABLE "IconUpload" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clerkId" TEXT NOT NULL,

    CONSTRAINT "IconUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IconUpload_clerkId_createdAt_idx" ON "IconUpload"("clerkId", "createdAt");

-- CreateIndex
CREATE INDEX "IconUpload_createdAt_idx" ON "IconUpload"("createdAt");
