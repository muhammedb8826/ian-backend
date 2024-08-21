/*
  Warnings:

  - A unique constraint covering the columns `[itemId,level]` on the table `discounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[itemId,name]` on the table `services` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "discounts_itemId_level_key" ON "discounts"("itemId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "services_itemId_name_key" ON "services"("itemId", "name");
