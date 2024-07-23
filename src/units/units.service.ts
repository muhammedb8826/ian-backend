import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

 async create(createUnitDto: CreateUnitDto) {
    return this.prisma.units.create({
      data: createUnitDto
    })
  }

  async findAll() {
    return this.prisma.units.findMany()
  }

  async findOne(id: string) {
    const unit = await this.prisma.units.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return unit;
  }

 async update(id: string, updateUnitDto: UpdateUnitDto) {
  const unit = await this.prisma.units.findUnique({ where: { id } });
  if (!unit) {
    throw new NotFoundException(`Unit with ID ${id} not found`);
  }
  return this.prisma.units.update({
    where: { id },
    data: updateUnitDto,
  });
  }

  async remove(id: string) {
    const unit = await this.prisma.units.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return this.prisma.units.delete({ where: { id } });
  }
}
