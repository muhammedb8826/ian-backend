import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUnitCategoryDto } from './dto/create-unit-category.dto';
import { UpdateUnitCategoryDto } from './dto/update-unit-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UnitCategoryService {
  constructor(private prisma: PrismaService){}
  async create(createUnitCategoryDto: CreateUnitCategoryDto) {

  const existingByName = await this.prisma.unitCategory.findUnique({
    where: {
      name: createUnitCategoryDto.name
    }
  })

  if(existingByName) {
    throw new ConflictException('Unit Category already exists')
  }

    return this.prisma.unitCategory.create({
      data: {
        name: createUnitCategoryDto.name,
        description: createUnitCategoryDto.description
      }
    })
  }

  async findAll(skip: number, take: number) {
    const [unitCategory, total] = await this.prisma.$transaction([
      this.prisma.unitCategory.findMany({
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.unitCategory.count()
    ])
    return {
      unitCategory,
      total
    }
  }

  async findAllUnitCategory() {
    return this.prisma.unitCategory.findMany()
  }

  async findOne(id: string) {
    return this.prisma.unitCategory.findUnique({
      where: {id},
    });
  }

  async update(id: string, updateUnitCategoryDto: UpdateUnitCategoryDto) {
    return this.prisma.unitCategory.update({
      where: {id},
      data: {
        name: updateUnitCategoryDto.name,
        description: updateUnitCategoryDto.description
      }
    })
  }

  async remove(id: string) {
    return this.prisma.unitCategory.delete({
      where: {id}
    })
  }
}
