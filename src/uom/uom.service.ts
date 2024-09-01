import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUomDto } from './dto/create-uom.dto';
import { UpdateUomDto } from './dto/update-uom.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UomService {
  constructor(private prisma: PrismaService){}
  async create(createUomDto: CreateUomDto) {
    // Check if the UOM already exists with the same name, abbreviation, and conversion rate
  const existingUom = await this.prisma.uOM.findFirst({
    where: {
      name: createUomDto.name,
      abbreviation: createUomDto.abbreviation,
      conversionRate: parseFloat(createUomDto.conversionRate.toString()),
      unitCategoryId: createUomDto.unitCategoryId,
    }
  });
    
    // If it exists, return the existing UOM
  if (existingUom) {
    return null;
  }


  // Check if there is already a base unit in this category
  if (createUomDto.baseUnit) {
    const existingBaseUnit = await this.prisma.uOM.findFirst({
        where: {
            baseUnit: true,
            unitCategoryId: createUomDto.unitCategoryId,
        }
    });

    // If a base unit exists, throw an exception
    if (existingBaseUnit) {
        throw new ConflictException('A base unit already exists in this category. Only one base unit is allowed.');
    }
}

    // If it doesn't exist, create a new one
  return this.prisma.uOM.create({
    data: {
      name: createUomDto.name,
      abbreviation: createUomDto.abbreviation,
      conversionRate: parseFloat(createUomDto.conversionRate.toString()),
      baseUnit: createUomDto.baseUnit,
      unitCategoryId: createUomDto.unitCategoryId,
    }
  });
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
      where: {id},
      include: {
        unitCategory: true
      }
    });
  }

  async update(id: string, updateUomDto: UpdateUomDto) {

    // Find the UOM being updated
    const uomToUpdate = await this.prisma.uOM.findUnique({
      where: { id },
  });

  if (!uomToUpdate) {
      throw new NotFoundException('UOM not found');
  }

  // Check if the updated values conflict with existing UOMs
  const existingUom = await this.prisma.uOM.findFirst({
    where: {
        name: updateUomDto.name,
        abbreviation: updateUomDto.abbreviation,
        conversionRate: parseFloat(updateUomDto.conversionRate.toString()),
        unitCategoryId: updateUomDto.unitCategoryId,
        NOT: { id: id } // Exclude the current UOM being updated
    }
});

if (existingUom) {
    throw new ConflictException('UOM already exists in this category');
}

  
    // If the new baseUnit value is true, handle existing base unit
    if (updateUomDto.baseUnit) {
      // Find any existing base unit in the same category
      const existingBaseUnit = await this.prisma.uOM.findFirst({
          where: {
              baseUnit: true,
              unitCategoryId: updateUomDto.unitCategoryId,
              NOT: { id: id } // Exclude the current UOM being updated
          }
      });

      // If an existing base unit is found, set it to false
      if (existingBaseUnit) {
          await this.prisma.uOM.update({
              where: { id: existingBaseUnit.id },
              data: { baseUnit: false }
          });
      }
  }

    
    return this.prisma.uOM.update({
      where: {id},
      data: {
        name: updateUomDto.name,
        abbreviation: updateUomDto.abbreviation,
        conversionRate: parseFloat(updateUomDto.conversionRate.toString()),
        baseUnit: updateUomDto.baseUnit,
        unitCategoryId: updateUomDto.unitCategoryId,
      }
    })
  }

  async remove(id: string) {
    try {
      return this.prisma.uOM.delete({
        where: {id}
      });
    } catch (error) {
      throw new NotFoundException('UOM not found');
    }
  }
}
