/*
  Warnings:

  - You are about to drop the column `amount` on the `commissions` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `commissions` table. All the data in the column will be lost.
  - Added the required column `totalAmount` to the `commissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderSource` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "commissions" DROP COLUMN "amount",
DROP COLUMN "description",
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "orderSource" TEXT NOT NULL;
