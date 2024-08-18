/*
  Warnings:

  - Added the required column `name` to the `stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stock" ADD COLUMN     "name" TEXT NOT NULL;
