/*
  Warnings:

  - A unique constraint covering the columns `[level]` on the table `discounts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "discounts_level_key" ON "discounts"("level");
