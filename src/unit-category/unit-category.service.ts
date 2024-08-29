import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUnitCategoryDto } from './dto/create-unit-category.dto';
import { UpdateUnitCategoryDto } from './dto/update-unit-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UnitCategoryService {
  constructor(private prisma: PrismaService){}
  async create(createUnitCategoryDto: CreateUnitCategoryDto) {
    const { name, description, constant, constantValue } = createUnitCategoryDto;

    const existingByName = await this.prisma.unitCategory.findFirst({
     where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    }); 

    if (existingByName) throw new ConflictException('Unit Category already exists');
 
    if(constant && constantValue < 2) throw new ConflictException('Constant value must be greater than 1');


    return this.prisma.unitCategory.create({
      data: { name, description, constant, constantValue }
    });
  }

  async findAll(skip: number, take: number) {
    const [unitCategories, total] = await this.prisma.$transaction([
      this.prisma.unitCategory.findMany({
        skip: +skip,
        take: +take,
        orderBy: { createdAt: 'desc' },
        include: { items: true, units: true }
      }),
      this.prisma.unitCategory.count(),
    ]);
    return { unitCategories, total };
  }


  async findAllUnitCategory() {
    return this.prisma.unitCategory.findMany({
      include: {
        items: true,
        units: true
      }
    })
  }

 async findOne(id: string) {
    const unitCategory = await this.prisma.unitCategory.findUnique({
      where: { id },
      include: { items: true, units: true },
    });
    if (!unitCategory) throw new NotFoundException('Unit Category not found');
    return unitCategory;
  }

  async update(id: string, updateUnitCategoryDto: UpdateUnitCategoryDto) {
    const { name, description, constant, constantValue } = updateUnitCategoryDto;

    return this.prisma.unitCategory.update({
      where: { id },
      data: { name, description, constant, constantValue },
      include: { units: true, items: true },
    });
  }

  async remove(id: string) {
    const unitCategory = await this.prisma.unitCategory.findUnique({
      where: { id },
      include: { items: true, units: true },
    });

    if (!unitCategory) throw new NotFoundException('Unit Category not found');
    if (unitCategory.items.length > 0) throw new BadRequestException('Cannot delete. Unit Category is assigned to items.');

    for (const uom of unitCategory.units) {
      const isUomInUse = await this.prisma.items.findFirst({
        where: {
          OR: [
            { saleUnitOfMeasureId: uom.id },
            { purchaseUnitOfMeasureId: uom.id },
            { unitOfMeasureId: uom.id },
          ],
        },
      });
      if (isUomInUse) throw new BadRequestException(`Cannot delete. UOM ${uom.name} is in use.`);
    }

    return this.prisma.unitCategory.delete({ where: { id } });
  }
}
