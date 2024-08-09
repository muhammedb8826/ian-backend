/*
  Warnings:

  - Added the required column `updatedAt` to the `purchases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "purchaseRepresentativeId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_purchaseRepresentativeId_fkey" FOREIGN KEY ("purchaseRepresentativeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
