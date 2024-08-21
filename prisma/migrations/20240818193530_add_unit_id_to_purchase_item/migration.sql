/*
  Warnings:

  - Added the required column `unitId` to the `PurchaseItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseItems" ADD COLUMN     "unitId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PurchaseItems" ADD CONSTRAINT "PurchaseItems_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
