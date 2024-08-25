-- DropForeignKey
ALTER TABLE "paymentTransactions" DROP CONSTRAINT "paymentTransactions_paymentTermId_fkey";

-- AddForeignKey
ALTER TABLE "paymentTransactions" ADD CONSTRAINT "paymentTransactions_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "paymentTerms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
