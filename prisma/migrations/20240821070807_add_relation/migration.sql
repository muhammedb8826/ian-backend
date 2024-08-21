-- DropForeignKey
ALTER TABLE "UOM" DROP CONSTRAINT "UOM_unitCategoryId_fkey";

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "unitCategoryId" TEXT;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_unitCategoryId_fkey" FOREIGN KEY ("unitCategoryId") REFERENCES "UnitCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UOM" ADD CONSTRAINT "UOM_unitCategoryId_fkey" FOREIGN KEY ("unitCategoryId") REFERENCES "UnitCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
