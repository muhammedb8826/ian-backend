import { Injectable } from '@nestjs/common';
import { CreateUomDto } from './dto/create-uom.dto';
import { UpdateUomDto } from './dto/update-uom.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UomService {
  constructor(private prisma: PrismaService){}
  async create(createUomDto: CreateUomDto) {
    return this.prisma.uOM.create({
      data: {
        name: createUomDto.name,
        abbreviation: createUomDto.abbreviation,
        conversionRate: createUomDto.conversionRate,
        baseUnit: createUomDto.baseUnit,
        unitCategoryId: createUomDto.unitCategoryId,

      }
    })
  }

  async findAll(categoryId?: string) {
    if (categoryId) {
      const categoryExists = await this.prisma.unitCategory.findUnique({
        where: { id: categoryId },
      });

      if (!categoryExists) {
        return []; // Return an empty array if the category doesn't exist
      }
    }

    return this.prisma.uOM.findMany({
      where: categoryId ? { unitCategoryId: categoryId } : {},
      include: {
        unitCategory: true
      }
    })
  }

  async findOne(id: string) {
    return this.prisma.uOM.findUnique({
      where: {id}
    });
  }

  async update(id: string, updateUomDto: UpdateUomDto) {
    return this.prisma.uOM.update({
      where: {id},
      data: {
        name: updateUomDto.name,
        abbreviation: updateUomDto.abbreviation,
        conversionRate: updateUomDto.conversionRate,
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
