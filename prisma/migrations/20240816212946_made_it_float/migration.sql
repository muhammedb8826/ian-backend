/*
  Warnings:

  - Added the required column `constantValue` to the `UnitCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UnitCategory" DROP COLUMN "constantValue",
ADD COLUMN     "constantValue" DOUBLE PRECISION NOT NULL;
