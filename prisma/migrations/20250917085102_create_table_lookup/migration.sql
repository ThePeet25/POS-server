-- CreateEnum
CREATE TYPE "DateType" AS ENUM ('Day', 'Month', 'Year');

-- CreateEnum
CREATE TYPE "TotalType" AS ENUM ('Income', 'Spend');

-- CreateTable
CREATE TABLE "total_lookup" (
    "id" SERIAL NOT NULL,
    "type" "TotalType" NOT NULL,
    "Date_Type" "DateType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "ref" INTEGER,

    CONSTRAINT "total_lookup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "total_lookup" ADD CONSTRAINT "total_lookup_ref_fkey" FOREIGN KEY ("ref") REFERENCES "total_lookup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
