/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Attribute` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `constant` to the `UnitCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UnitCategory" ADD COLUMN     "constant" BOOLEAN NOT NULL,
ADD COLUMN     "constantValue" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_name_key" ON "Attribute"("name");
