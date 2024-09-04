/*
  Warnings:

  - Added the required column `baseUomId` to the `Pricing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pricing" ADD COLUMN     "baseUomId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Pricing" ADD CONSTRAINT "Pricing_baseUomId_fkey" FOREIGN KEY ("baseUomId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
