/*
  Warnings:

  - You are about to drop the column `purchaseUnitOfMeasureId` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `saleUnitOfMeasureId` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `unitOfMeasureId` on the `items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_purchaseUnitOfMeasureId_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_saleUnitOfMeasureId_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_unitOfMeasureId_fkey";

-- AlterTable
ALTER TABLE "items" DROP COLUMN "purchaseUnitOfMeasureId",
DROP COLUMN "saleUnitOfMeasureId",
DROP COLUMN "unitOfMeasureId",
ADD COLUMN     "defaultUomId" TEXT,
ADD COLUMN     "purchaseUomId" TEXT;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_purchaseUomId_fkey" FOREIGN KEY ("purchaseUomId") REFERENCES "UOM"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_defaultUomId_fkey" FOREIGN KEY ("defaultUomId") REFERENCES "UOM"("id") ON DELETE SET NULL ON UPDATE CASCADE;
