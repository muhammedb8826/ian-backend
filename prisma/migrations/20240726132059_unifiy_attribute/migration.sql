/*
  Warnings:

  - A unique constraint covering the columns `[attribute]` on the table `UnitAttribute` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UnitAttribute_attribute_key" ON "UnitAttribute"("attribute");
