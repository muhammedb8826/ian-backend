/*
  Warnings:

  - You are about to drop the column `unitId` on the `OperatorStock` table. All the data in the column will be lost.
  - You are about to drop the column `unitId` on the `PurchaseItems` table. All the data in the column will be lost.
  - You are about to drop the column `unitId` on the `SaleItems` table. All the data in the column will be lost.
  - Added the required column `uomId` to the `OperatorStock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uomId` to the `PurchaseItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uomId` to the `SaleItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PurchaseItems" DROP CONSTRAINT "PurchaseItems_unitId_fkey";

-- DropForeignKey
ALTER TABLE "SaleItems" DROP CONSTRAINT "SaleItems_unitId_fkey";

-- AlterTable
ALTER TABLE "OperatorStock" DROP COLUMN "unitId",
ADD COLUMN     "uomId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseItems" DROP COLUMN "unitId",
ADD COLUMN     "uomId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SaleItems" DROP COLUMN "unitId",
ADD COLUMN     "uomId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PurchaseItems" ADD CONSTRAINT "PurchaseItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItems" ADD CONSTRAINT "SaleItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
