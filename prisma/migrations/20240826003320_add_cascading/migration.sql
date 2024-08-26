/*
  Warnings:

  - You are about to drop the column `orderId` on the `commissionTransactions` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `paymentTransactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "commissions" DROP CONSTRAINT "commissions_orderId_fkey";

-- DropForeignKey
ALTER TABLE "commissions" DROP CONSTRAINT "commissions_salesPartnerId_fkey";

-- DropForeignKey
ALTER TABLE "paymentTerms" DROP CONSTRAINT "paymentTerms_orderId_fkey";

-- AlterTable
ALTER TABLE "commissionTransactions" DROP COLUMN "orderId";

-- AlterTable
ALTER TABLE "paymentTransactions" DROP COLUMN "orderId";

-- AddForeignKey
ALTER TABLE "paymentTerms" ADD CONSTRAINT "paymentTerms_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_salesPartnerId_fkey" FOREIGN KEY ("salesPartnerId") REFERENCES "salesPartners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
