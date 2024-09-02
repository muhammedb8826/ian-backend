/*
  Warnings:

  - You are about to drop the column `amount` on the `OperatorStock` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `OperatorStock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OperatorStock" DROP COLUMN "amount",
DROP COLUMN "unitPrice";
