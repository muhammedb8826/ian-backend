/*
  Warnings:

  - You are about to drop the column `itemId` on the `PurchaseItemNote` table. All the data in the column will be lost.
  - Added the required column `purchaseItemId` to the `PurchaseItemNote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PurchaseItemNote" DROP CONSTRAINT "PurchaseItemNote_itemId_fkey";

-- DropIndex
DROP INDEX "PurchaseItemNote_itemId_idx";

-- AlterTable
ALTER TABLE "PurchaseItemNote" DROP COLUMN "itemId",
ADD COLUMN     "purchaseItemId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "PurchaseItemNote_purchaseItemId_idx" ON "PurchaseItemNote"("purchaseItemId");

-- AddForeignKey
ALTER TABLE "PurchaseItemNote" ADD CONSTRAINT "PurchaseItemNote_purchaseItemId_fkey" FOREIGN KEY ("purchaseItemId") REFERENCES "PurchaseItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
