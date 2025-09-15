-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isDeleted" BOOLEAN DEFAULT false;
