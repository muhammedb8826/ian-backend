-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_purchaseUnitOfMeasureId_fkey";

-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_unitOfMeasureId_fkey";

-- AlterTable
ALTER TABLE "items" ALTER COLUMN "purchaseUnitOfMeasureId" DROP NOT NULL,
ALTER COLUMN "unitOfMeasureId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_purchaseUnitOfMeasureId_fkey" FOREIGN KEY ("purchaseUnitOfMeasureId") REFERENCES "UOM"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_unitOfMeasureId_fkey" FOREIGN KEY ("unitOfMeasureId") REFERENCES "UOM"("id") ON DELETE SET NULL ON UPDATE CASCADE;
