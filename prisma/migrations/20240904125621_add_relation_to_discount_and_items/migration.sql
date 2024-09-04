-- AlterTable
ALTER TABLE "discounts" ADD COLUMN     "description" TEXT;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
