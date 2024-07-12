/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'RECEPTION', 'GRAPHIC_DESIGNER', 'OPERATOR', 'FINANCE', 'STORE_REPRESENTATIVE');

-- CreateEnum
CREATE TYPE "UserMachinePermission" AS ENUM ('UV', 'DTG', 'EMBROIDERY', 'LASER', 'SCREEN_PRINTING', 'HEAT_PRESS', 'VINYL', 'SUBLIMATION');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "gender" TEXT NOT NULL DEFAULT 'male',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "machinePermissions" "UserMachinePermission"[],
ADD COLUMN     "middle_name" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profile" TEXT,
ADD COLUMN     "roles" "Role" NOT NULL DEFAULT 'ADMIN';
