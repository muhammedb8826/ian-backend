/*
  Warnings:

  - Added the required column `baseUomId` to the `SaleItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `SaleItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SaleItems" ADD COLUMN     "baseUomId" TEXT NOT NULL,
ADD COLUMN     "unit" DOUBLE PRECISION NOT NULL;
