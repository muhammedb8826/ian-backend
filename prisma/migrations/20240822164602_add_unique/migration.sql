/*
  Warnings:

  - A unique constraint covering the columns `[fullName,phone,email]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "customers_email_key";

-- DropIndex
DROP INDEX "customers_fullName_email_phone_idx";

-- DropIndex
DROP INDEX "customers_fullName_key";

-- DropIndex
DROP INDEX "customers_phone_key";

-- CreateIndex
CREATE UNIQUE INDEX "customers_fullName_phone_email_key" ON "customers"("fullName", "phone", "email");
