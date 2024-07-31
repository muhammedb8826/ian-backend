/*
  Warnings:

  - A unique constraint covering the columns `[abbreviation]` on the table `UOM` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UOM_abbreviation_key" ON "UOM"("abbreviation");
