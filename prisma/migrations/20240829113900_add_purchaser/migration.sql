/*
  Warnings:

  - You are about to drop the column `purchaseRepresentativeId` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `machine_permissions` on the `users` table. All the data in the column will be lost.
  - Added the required column `purchaserId` to the `purchases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PURCHASER';

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_purchaseRepresentativeId_fkey";

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "purchaseRepresentativeId",
ADD COLUMN     "purchaserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "machine_permissions";

-- DropEnum
DROP TYPE "UserMachinePermission";

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_purchaserId_fkey" FOREIGN KEY ("purchaserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
