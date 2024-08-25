/*
  Warnings:

  - A unique constraint covering the columns `[orderId,itemId,serviceId]` on the table `OrderItems` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,abbreviation,unitCategoryId]` on the table `UOM` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UOM_abbreviation_key";

-- DropIndex
DROP INDEX "UOM_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "OrderItems_orderId_itemId_serviceId_key" ON "OrderItems"("orderId", "itemId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "UOM_name_abbreviation_unitCategoryId_key" ON "UOM"("name", "abbreviation", "unitCategoryId");
