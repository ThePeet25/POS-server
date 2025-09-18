/*
  Warnings:

  - A unique constraint covering the columns `[dateValue]` on the table `total_lookup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "total_lookup_dateValue_key" ON "total_lookup"("dateValue");
