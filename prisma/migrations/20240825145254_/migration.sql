/*
  Warnings:

  - You are about to drop the column `sellingPrice` on the `services` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `services` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_itemId_fkey";

-- DropIndex
DROP INDEX "services_itemId_name_key";

-- AlterTable
ALTER TABLE "services" DROP COLUMN "sellingPrice";

-- CreateTable
CREATE TABLE "ItemService" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_itemsToservices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemService_itemId_serviceId_key" ON "ItemService"("itemId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "_itemsToservices_AB_unique" ON "_itemsToservices"("A", "B");

-- CreateIndex
CREATE INDEX "_itemsToservices_B_index" ON "_itemsToservices"("B");

-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "services"("name");

-- AddForeignKey
ALTER TABLE "ItemService" ADD CONSTRAINT "ItemService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemService" ADD CONSTRAINT "ItemService_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_itemsToservices" ADD CONSTRAINT "_itemsToservices_A_fkey" FOREIGN KEY ("A") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_itemsToservices" ADD CONSTRAINT "_itemsToservices_B_fkey" FOREIGN KEY ("B") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
