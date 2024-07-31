/*
  Warnings:

  - Added the required column `purchaseUnitOfMeasureId` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchase_price` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selling_price` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitOfMeasureId` to the `items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "items" ADD COLUMN     "can_be_purchased" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "can_be_sold" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "purchaseUnitOfMeasureId" TEXT NOT NULL,
ADD COLUMN     "purchase_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "selling_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unitOfMeasureId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_unitOfMeasureId_fkey" FOREIGN KEY ("unitOfMeasureId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_purchaseUnitOfMeasureId_fkey" FOREIGN KEY ("purchaseUnitOfMeasureId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
