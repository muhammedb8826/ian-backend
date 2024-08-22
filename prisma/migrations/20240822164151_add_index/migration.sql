-- CreateIndex
CREATE INDEX "customers_fullName_email_phone_idx" ON "customers"("fullName", "email", "phone");
