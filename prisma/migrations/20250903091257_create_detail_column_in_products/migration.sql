/*
  Warnings:

  - A unique constraint covering the columns `[receiptId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiptId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "receiptId" VARCHAR(4) NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "detail" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "orders_receiptId_key" ON "orders"("receiptId");
