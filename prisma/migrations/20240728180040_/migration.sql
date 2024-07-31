/*
  Warnings:

  - You are about to drop the `UnitAttribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pricing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `units` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UnitAttribute" DROP CONSTRAINT "UnitAttribute_itemId_fkey";

-- DropForeignKey
ALTER TABLE "UnitAttribute" DROP CONSTRAINT "UnitAttribute_unitId_fkey";

-- DropForeignKey
ALTER TABLE "pricing" DROP CONSTRAINT "pricing_itemId_fkey";

-- DropForeignKey
ALTER TABLE "pricing" DROP CONSTRAINT "pricing_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "pricing" DROP CONSTRAINT "pricing_unitId_fkey";

-- DropTable
DROP TABLE "UnitAttribute";

-- DropTable
DROP TABLE "pricing";

-- DropTable
DROP TABLE "units";

-- CreateTable
CREATE TABLE "UnitCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UOM" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "conversionRate" DOUBLE PRECISION NOT NULL,
    "baseUnit" BOOLEAN NOT NULL DEFAULT false,
    "unitCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UOM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UOMAttribute" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "uomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UOMAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnitCategory_name_key" ON "UnitCategory"("name");

-- AddForeignKey
ALTER TABLE "UOM" ADD CONSTRAINT "UOM_unitCategoryId_fkey" FOREIGN KEY ("unitCategoryId") REFERENCES "UnitCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UOMAttribute" ADD CONSTRAINT "UOMAttribute_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
