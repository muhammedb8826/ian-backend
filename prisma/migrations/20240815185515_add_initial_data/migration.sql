/*
  Warnings:

  - You are about to drop the `stock` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quantity` to the `items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "stock" DROP CONSTRAINT "stock_itemId_fkey";

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "quantity" INTEGER NOT NULL;

-- DropTable
DROP TABLE "stock";
