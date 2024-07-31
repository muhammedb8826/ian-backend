/*
  Warnings:

  - The primary key for the `UOMAttribute` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[width]` on the table `UOMAttribute` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[height]` on the table `UOMAttribute` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UOMAttribute" DROP CONSTRAINT "UOMAttribute_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "UOMAttribute_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UOMAttribute_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "UOMAttribute_width_key" ON "UOMAttribute"("width");

-- CreateIndex
CREATE UNIQUE INDEX "UOMAttribute_height_key" ON "UOMAttribute"("height");
