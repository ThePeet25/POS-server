/*
  Warnings:

  - A unique constraint covering the columns `[barcode,isDeleted]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "products_barcode_key";

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_isDeleted_key" ON "products"("barcode", "isDeleted");
