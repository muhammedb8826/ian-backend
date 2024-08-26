-- DropForeignKey
ALTER TABLE "commissionTransactions" DROP CONSTRAINT "commissionTransactions_commissionId_fkey";

-- AddForeignKey
ALTER TABLE "commissionTransactions" ADD CONSTRAINT "commissionTransactions_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "commissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
