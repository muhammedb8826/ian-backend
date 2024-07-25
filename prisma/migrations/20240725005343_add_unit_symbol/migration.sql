/*
  Warnings:

  - You are about to drop the column `data_type` on the `units` table. All the data in the column will be lost.
  - Added the required column `attribute` to the `UnitAttribute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attribute_value` to the `UnitAttribute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symbol` to the `units` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UnitAttribute" ADD COLUMN     "attribute" TEXT NOT NULL,
ADD COLUMN     "attribute_value" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "units" DROP COLUMN "data_type",
ADD COLUMN     "symbol" TEXT NOT NULL;
