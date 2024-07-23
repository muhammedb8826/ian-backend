import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUnitAttributeDto } from './dto/create-unit-attribute.dto';
import { UpdateUnitAttributeDto } from './dto/update-unit-attribute.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UnitAttributeService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUnitAttributeDto: CreateUnitAttributeDto) {
    const { itemId, unitId, value } = createUnitAttributeDto;

    // Check if a record with the same itemId and unitId already exists
    const existingRecord = await this.prisma.unitAttribute.findUnique({
      where: {
        itemId_unitId: {
          itemId,
          unitId,
        },
      },
    });

    if (existingRecord) {
      throw new ConflictException('UnitAttribute with the given itemId and unitId already exists');
    }

    return this.prisma.unitAttribute.create({
      data: {
        itemId,
        unitId,
        value,
      },
    });
  }

  async findAll() {
    return this.prisma.unitAttribute.findMany();
  }

  async findOne(id: string) {
    const unitAttribute = await this.prisma.unitAttribute.findUnique({ where: { id } });
    if (!unitAttribute) {
      throw new NotFoundException(`UnitAttribute with ID ${id} not found`);
    }
    return unitAttribute;
  }

  async update(id: string, updateUnitAttributeDto: UpdateUnitAttributeDto) {
    const unitAttribute = await this.prisma.unitAttribute.findUnique({ where: { id } });
    if (!unitAttribute) {
      throw new NotFoundException(`UnitAttribute with ID ${id} not found`);
    }
    return this.prisma.unitAttribute.update({
      where: { id },
      data: updateUnitAttributeDto,
    });
  }

  async remove(id: string) {
    const unitAttribute = await this.prisma.unitAttribute.findUnique({ where: { id } });
    if (!unitAttribute) {
      throw new NotFoundException(`UnitAttribute with ID ${id} not found`);
    }
    return this.prisma.unitAttribute.delete({ where: { id } });
  }
}
