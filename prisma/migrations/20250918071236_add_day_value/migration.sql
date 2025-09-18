/*
  Warnings:

  - Added the required column `dateValue` to the `total_lookup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "total_lookup" ADD COLUMN     "dateValue" TEXT NOT NULL;
