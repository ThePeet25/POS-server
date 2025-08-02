/*
  Warnings:

  - Changed the type of `discountType` on the `promotions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCEN', 'FIXED');

-- AlterTable
ALTER TABLE "promotions" ADD COLUMN     "status" "PromotionStatus" NOT NULL DEFAULT 'UPCOMING',
DROP COLUMN "discountType",
ADD COLUMN     "discountType" "DiscountType" NOT NULL;
