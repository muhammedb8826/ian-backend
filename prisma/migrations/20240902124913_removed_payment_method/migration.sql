/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `sales` table. All the data in the column will be lost.
  - Added the required column `totalQuantity` to the `sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sales" DROP COLUMN "paymentMethod",
DROP COLUMN "reference",
ADD COLUMN     "totalQuantity" INTEGER NOT NULL;
