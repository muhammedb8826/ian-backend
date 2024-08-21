-- AddForeignKey
ALTER TABLE "OperatorStock" ADD CONSTRAINT "OperatorStock_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
