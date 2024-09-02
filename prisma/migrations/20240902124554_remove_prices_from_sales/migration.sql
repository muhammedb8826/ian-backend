/*
  Warnings:

  - You are about to drop the column `amount` on the `SaleItems` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `SaleItems` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `totalQuantity` on the `sales` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SaleItems" DROP COLUMN "amount",
DROP COLUMN "unitPrice";

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "amount",
DROP COLUMN "totalAmount",
DROP COLUMN "totalQuantity";
