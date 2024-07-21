import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserMachineService {
    constructor(private prisma: PrismaService) { }

    async assignMachineToUser(userId: string, machineId: string[]) {

        const assignments = machineId.map(machineId => ({
            userId,
            machineId,
          }));

          return this.prisma.userMachine.createMany({
            data: assignments,
            skipDuplicates: true, // Optional: to skip duplicates if any
          });
      }

      async getUserMachines() {
        return this.prisma.userMachine.findMany({
          include: {
            user: true,
            machine: true,
          },
        });
      }
      
      async getUserMachineById(id: string) {
        return this.prisma.userMachine.findUnique({
          where: { id },
          include: {
            user: true,
            machine: true,
          },
        });
      }

      async updateUserMachine(id: string, machineId: string[]) {
        const updates = machineId.map(machineId => 
            this.prisma.userMachine.update({
              where: { id },
              data: { machineId },
            })
          );
          return Promise.all(updates);
      }

      async deleteUserMachine(id: string) {
        return this.prisma.userMachine.delete({
          where: { id },
        });
      }
}
