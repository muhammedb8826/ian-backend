import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserMachineService {
  constructor(private prisma: PrismaService) { }

  async assignMachineToUser(userId: string, machineId: string[]) {

    if (!Array.isArray(machineId)) {
      throw new BadRequestException('machineId must be an array');
  }

  if (machineId.length === 0) {
      throw new BadRequestException('No machines provided for assignment');
  }

    // Check for existing assignments
    const existingAssignments = await this.prisma.userMachine.findMany({
      where: {
        userId,
        machineId: { in: machineId },
      },
    });

    const existingMachineIds = new Set(existingAssignments.map(a => a.machineId));
    const newMachineIds = machineId.filter(id => id && !existingMachineIds.has(id));

    if (newMachineIds.length === 0) {
      // All provided machines are already assigned
      throw new BadRequestException('All provided machines are already assigned to this user.');
    }

    const newAssignments = newMachineIds.map(machineId => ({
      userId,
      machineId,
    }));

    try {
      await this.prisma.userMachine.createMany({
        data: newAssignments,
        skipDuplicates: true, // Skip duplicates at the database level
      });

      // Include information about duplicates in the response
      return {
        success: true,
        message: 'Machines assigned successfully.',
        duplicates: existingMachineIds.size > 0 ? Array.from(existingMachineIds) : [],
      };
    } catch (error) {
      throw new Error('Error assigning machines to user');
    }
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
