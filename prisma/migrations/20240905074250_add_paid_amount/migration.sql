/*
  Warnings:

  - Added the required column `paidAmount` to the `commissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "commissions" ADD COLUMN     "paidAmount" DOUBLE PRECISION NOT NULL;
