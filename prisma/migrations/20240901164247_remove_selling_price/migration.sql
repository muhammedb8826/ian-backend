/*
  Warnings:

  - You are about to drop the column `purchase_price` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `selling_price` on the `items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "discounts" DROP CONSTRAINT "discounts_itemId_fkey";

-- AlterTable
ALTER TABLE "items" DROP COLUMN "purchase_price",
DROP COLUMN "selling_price";
