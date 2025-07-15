-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Cashier', 'Manager');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwornd" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'Cashier',
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
