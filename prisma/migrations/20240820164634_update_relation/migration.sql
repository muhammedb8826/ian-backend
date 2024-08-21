/*
  Warnings:

  - Added the required column `sellingPrice` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_itemId_fkey";

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "sellingPrice" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
