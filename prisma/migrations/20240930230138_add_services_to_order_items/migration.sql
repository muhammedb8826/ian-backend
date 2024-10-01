-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
