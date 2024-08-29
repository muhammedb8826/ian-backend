/*
  Warnings:

  - You are about to drop the column `itemId` on the `SalesItemNote` table. All the data in the column will be lost.
  - Added the required column `saleItemId` to the `SalesItemNote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SalesItemNote" DROP CONSTRAINT "SalesItemNote_itemId_fkey";

-- DropIndex
DROP INDEX "SalesItemNote_itemId_idx";

-- AlterTable
ALTER TABLE "SalesItemNote" DROP COLUMN "itemId",
ADD COLUMN     "saleItemId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "SalesItemNote_saleItemId_idx" ON "SalesItemNote"("saleItemId");

-- AddForeignKey
ALTER TABLE "SalesItemNote" ADD CONSTRAINT "SalesItemNote_saleItemId_fkey" FOREIGN KEY ("saleItemId") REFERENCES "SaleItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
