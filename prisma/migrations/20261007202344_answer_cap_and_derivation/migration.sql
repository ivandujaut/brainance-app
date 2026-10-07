-- AlterTable
ALTER TABLE "ChatBot" ADD COLUMN     "dailyAnswerCap" INTEGER;

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "derivation" BOOLEAN NOT NULL DEFAULT false;
