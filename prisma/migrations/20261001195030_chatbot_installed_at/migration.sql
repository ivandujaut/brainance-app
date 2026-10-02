-- AlterTable
ALTER TABLE "ChatBot" ADD COLUMN     "installedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "type" SET DEFAULT 'owner';
