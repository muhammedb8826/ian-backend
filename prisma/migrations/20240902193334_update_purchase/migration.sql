/*
  Warnings:

  - Added the required column `baseUomId` to the `PurchaseItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `PurchaseItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalUnit` to the `purchases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseItems" ADD COLUMN     "baseUomId" TEXT NOT NULL,
ADD COLUMN     "unit" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "totalUnit" DOUBLE PRECISION NOT NULL;
