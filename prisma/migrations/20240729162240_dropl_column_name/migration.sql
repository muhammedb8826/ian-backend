/*
  Warnings:

  - You are about to drop the column `name` on the `UOMAttribute` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `UOMAttribute` table. All the data in the column will be lost.
  - Added the required column `height` to the `UOMAttribute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `UOMAttribute` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UOMAttribute" DROP COLUMN "name",
DROP COLUMN "value",
ADD COLUMN     "height" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "width" DOUBLE PRECISION NOT NULL;
