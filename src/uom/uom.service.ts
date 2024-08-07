import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUomDto } from './dto/create-uom.dto';
import { UpdateUomDto } from './dto/update-uom.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UomService {
  constructor(private prisma: PrismaService){}
  async create(createUomDto: CreateUomDto) {
    const existingByNameOrAbbreviation = await this.prisma.uOM.findFirst({
      where: {
        OR: [
          { name: createUomDto.name },
          { abbreviation: createUomDto.abbreviation }
        ]
      }
    });

    if(existingByNameOrAbbreviation) {
      throw new ConflictException('UOM already exists')
    }

    const conversionRate = typeof createUomDto.conversionRate === 'string'
    ? parseFloat(createUomDto.conversionRate)
    : createUomDto.conversionRate;

    return this.prisma.uOM.create({
      data: {
        name: createUomDto.name,
        abbreviation: createUomDto.abbreviation,
        conversionRate: conversionRate,
        baseUnit: createUomDto.baseUnit,
        unitCategoryId: createUomDto.unitCategoryId,

      }
    })
  }

  async findAll(categoryId?: string) {
    // If no categoryId is provided, return an empty array
    if (!categoryId) {
      return [];
    }
  
    // Check if the category with the provided id exists
    const categoryExists = await this.prisma.unitCategory.findUnique({
      where: { id: categoryId },
    });

    // If the category does not exist, return an empty array
    if (!categoryExists) {
      return [];
    }
  
    // Return uOM instances belonging to the provided categoryId
    const results =  this.prisma.uOM.findMany({
      where: { unitCategoryId: categoryId },
      include: {
        unitCategory: true,
      },
    });
    return results;
  }

  async findAllUoms() {
    return this.prisma.uOM.findMany({
      include: {
        unitCategory: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.uOM.findUnique({
      where: {id}
    });
  }

  async update(id: string, updateUomDto: UpdateUomDto) {

    const existingByNameOrAbbreviation = await this.prisma.uOM.findFirst({
      where: {
        OR: [
          { name: updateUomDto.name },
          { abbreviation: updateUomDto.abbreviation }
        ]
      }
    });

    if(existingByNameOrAbbreviation) {
      throw new ConflictException('UOM already exists')
    }

    const existingUnit = await this.prisma.uOM.findUnique({
      where: {
        id: updateUomDto.id
      }
    });
  
    if (!existingUnit) {
      throw new NotFoundException('UOM not found');
    }
    const conversionRate = typeof updateUomDto.conversionRate === 'string'
    ? parseFloat(updateUomDto.conversionRate)
    : updateUomDto.conversionRate;
    return this.prisma.uOM.update({
      where: {id},
      data: {
        name: updateUomDto.name,
        abbreviation: updateUomDto.abbreviation,
        conversionRate: conversionRate,
        baseUnit: updateUomDto.baseUnit,
        unitCategoryId: updateUomDto.unitCategoryId,
      }
    })
  }

  async remove(id: string) {
    return this.prisma.uOM.delete({
      where: {id}
    })
  }
}
