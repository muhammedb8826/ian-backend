/*
  Warnings:

  - Added the required column `unitId` to the `SaleItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SaleItems" ADD COLUMN     "unitId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "SaleItems" ADD CONSTRAINT "SaleItems_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
