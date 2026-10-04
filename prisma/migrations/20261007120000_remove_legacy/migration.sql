-- Spec 008: remove what the beta does not use. The v1 code lives in the git tag "legado-corinna".
-- Safety net: stop if any legacy table still has data (export it before running this migration).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Bookings") OR EXISTS (SELECT 1 FROM "Campaign") OR EXISTS (SELECT 1 FROM "Product") THEN
    RAISE EXCEPTION 'Bookings, Campaign or Product have rows: export them before removing the tables (spec 008).';
  END IF;
END $$;

-- DropForeignKey
ALTER TABLE "Bookings" DROP CONSTRAINT "Bookings_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_userId_fkey";

-- DropForeignKey
ALTER TABLE "Domain" DROP CONSTRAINT "Domain_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_domainId_fkey";

-- AlterTable
ALTER TABLE "ChatBot" DROP COLUMN "helpdesk",
DROP COLUMN "textColor";

-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN "live",
DROP COLUMN "mailed";

-- AlterTable
ALTER TABLE "Domain" DROP COLUMN "campaignId";

-- AlterTable
ALTER TABLE "FilterQuestions" DROP COLUMN "answered";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "stripeId",
DROP COLUMN "type";

-- DropTable
DROP TABLE "Bookings";

-- DropTable
DROP TABLE "Campaign";

-- DropTable
DROP TABLE "Product";

