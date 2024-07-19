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

   const existingByName = await this.prisma.machines.findUnique({
    where: {
      name: createMachineDto.name
    }
   })

   if(existingByName) {
    throw new ConflictException('Machine already exists')
   }

    return await this.prisma.machines.create({
      data: {
        name: createMachineDto.name,
        description: createMachineDto.description,
        status: booleanValue
      }
    })
  }

  findAll() {
    return this.prisma.machines.findMany();
  }

  findOne(id: string) {
    return this.prisma.machines.findUnique({
      where: {id}
    });
  }

  update(id: string, updateMachineDto: UpdateMachineDto) {
    return this.prisma.machines.update({
      where: {id},
      data: updateMachineDto
    })
  }

  remove(id: string) {
    return this.prisma.machines.delete({
      where: {id},
    });
  }
}
