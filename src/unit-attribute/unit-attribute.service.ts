import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUnitAttributeDto } from './dto/create-unit-attribute.dto';
import { UpdateUnitAttributeDto } from './dto/update-unit-attribute.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UnitAttributeService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUnitAttributeDto: CreateUnitAttributeDto) {
    const { itemId, unitId, quantity, attribute, attribute_value } = createUnitAttributeDto;
    try {
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

      return await this.prisma.unitAttribute.create({
        data: {
          itemId,
          unitId,
          quantity,
          attribute,
          attribute_value,
        },
      });
    } catch (error) {
      if (error.code === 'P2003') { // Prisma error code for foreign key constraint violation
        throw new ConflictException('Foreign key constraint failed. Please ensure the itemId and unitId are valid.');
      }
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async findAll(skip: number, take: number) {
    const [unitAttributes, total] = await this.prisma.$transaction([
      this.prisma.unitAttribute.findMany({
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.unitAttribute.count(),
    ]);
    return {
      unitAttributes,
      total,
    };
  }

  async findAllUnitAttributes() {
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
