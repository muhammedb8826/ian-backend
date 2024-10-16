import { ConflictException, Injectable } from '@nestjs/common';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { machines } from '@prisma/client';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService){}
  async create(createMachineDto: CreateMachineDto): Promise<machines> {
    const booleanValue = Boolean(createMachineDto.status)

    const existingByName = await this.prisma.machines.findFirst({
      where: {
        name: {
          equals: createMachineDto.name,
          mode: 'insensitive', // This makes the comparison case-insensitive
        },
      },
      
    });
  
    if (existingByName) {
      throw new ConflictException('Machine already exists');
    }

    return await this.prisma.machines.create({
      data: {
        name: createMachineDto.name,
        description: createMachineDto.description,
        status: booleanValue
      }
    })
  }

  async findAll(skip: number, take: number) {
    const [machines, total] = await this.prisma.$transaction([
      this.prisma.machines.findMany({
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.machines.count()
    ])
    return {
      machines,
      total
    }
  }

  async findAllMachines() {
    return this.prisma.machines.findMany()
  }

  async findOne(id: string) {
    return this.prisma.machines.findUnique({
      where: {id}
    });
  }

  async update(id: string, updateMachineDto: UpdateMachineDto) {
    return this.prisma.machines.update({
      where: {id},
      data: updateMachineDto
    })
  }

  async remove(id: string) {
    return this.prisma.machines.delete({
      where: {id},
    });
  }
}
