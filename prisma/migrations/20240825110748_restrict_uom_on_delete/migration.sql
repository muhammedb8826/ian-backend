-- DropForeignKey
ALTER TABLE "UOM" DROP CONSTRAINT "UOM_unitCategoryId_fkey";

-- AddForeignKey
ALTER TABLE "UOM" ADD CONSTRAINT "UOM_unitCategoryId_fkey" FOREIGN KEY ("unitCategoryId") REFERENCES "UnitCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
