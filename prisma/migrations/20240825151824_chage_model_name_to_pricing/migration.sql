/*
  Warnings:

  - You are about to drop the `ItemService` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ItemService" DROP CONSTRAINT "ItemService_itemId_fkey";

-- DropForeignKey
ALTER TABLE "ItemService" DROP CONSTRAINT "ItemService_serviceId_fkey";

-- DropTable
DROP TABLE "ItemService";

-- CreateTable
CREATE TABLE "Pricing" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pricing_itemId_serviceId_key" ON "Pricing"("itemId", "serviceId");

-- AddForeignKey
ALTER TABLE "Pricing" ADD CONSTRAINT "Pricing_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pricing" ADD CONSTRAINT "Pricing_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
