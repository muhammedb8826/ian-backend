/*
  Warnings:

  - You are about to drop the column `quantity` on the `discounts` table. All the data in the column will be lost.
  - Added the required column `baseUomId` to the `OrderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `OrderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `discounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItems" ADD COLUMN     "baseUomId" TEXT NOT NULL,
ADD COLUMN     "unit" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "discounts" DROP COLUMN "quantity",
ADD COLUMN     "unit" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
