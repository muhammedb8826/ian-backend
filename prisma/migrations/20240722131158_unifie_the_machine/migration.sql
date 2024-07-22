/*
  Warnings:

  - A unique constraint covering the columns `[userId,machineId]` on the table `UserMachine` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserMachine_userId_machineId_key" ON "UserMachine"("userId", "machineId");
