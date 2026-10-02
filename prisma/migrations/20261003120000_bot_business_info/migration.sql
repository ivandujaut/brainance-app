
-- AlterTable
ALTER TABLE "ChatBot" ADD COLUMN     "addressing" TEXT NOT NULL DEFAULT 'vos',
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "description" TEXT;

