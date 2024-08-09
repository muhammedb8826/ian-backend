/*
  Warnings:

  - A unique constraint covering the columns `[purchaseId,itemId]` on the table `PurchaseItems` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PurchaseItems_purchaseId_itemId_key" ON "PurchaseItems"("purchaseId", "itemId");
