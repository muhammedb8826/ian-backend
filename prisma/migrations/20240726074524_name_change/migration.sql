/*
  Warnings:

  - You are about to drop the column `value` on the `UnitAttribute` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `UnitAttribute` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UnitAttribute" DROP COLUMN "value",
ADD COLUMN     "quantity" INTEGER NOT NULL;
