import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

 async create(createUnitDto: CreateUnitDto) {
   const normalizedAttribute = createUnitDto.name.toLowerCase();
    const existingByName = await this.prisma.units.findUnique({
      where: {
        name: normalizedAttribute
      }
    })

    if(existingByName) {
      throw new ConflictException('Unit already exists')
    }

    return await this.prisma.units.create({
      data: {
        name: createUnitDto.name,
        symbol: createUnitDto.symbol,
      }
    })
  }

  async findAll(skip: number, take: number) {
    const [units, total] = await this.prisma.$transaction([
      this.prisma.units.findMany({
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.units.count()
    ])
    return {
      units,
      total
    }
  }

  async findAllUnits() {
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
    // Check if the unit exists
    const unit = await this.prisma.units.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    try {
      return await this.prisma.units.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Cannot delete unit due to existing dependencies. Please remove associated data first.');
      }
      throw error;
    }
  }
}
