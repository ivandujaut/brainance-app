-- AlterTable
ALTER TABLE "ChatBot" ADD COLUMN     "leadCapture" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "leadEmail" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "consentAt" TIMESTAMP(3),
ADD COLUMN     "leadAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "LeadSubmission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "customerId" UUID NOT NULL,

    CONSTRAINT "LeadSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadSubmission_customerId_createdAt_idx" ON "LeadSubmission"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Customer_domainId_leadAt_idx" ON "Customer"("domainId", "leadAt");

-- AddForeignKey
ALTER TABLE "LeadSubmission" ADD CONSTRAINT "LeadSubmission_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

