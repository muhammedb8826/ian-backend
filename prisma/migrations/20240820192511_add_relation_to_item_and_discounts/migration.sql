/*
  Warnings:

  - You are about to drop the column `percent` on the `discounts` table. All the data in the column will be lost.
  - Added the required column `percentage` to the `discounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `discounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "discounts" DROP COLUMN "percent",
ADD COLUMN     "percentage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL;
