import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUnitAttributeDto } from './dto/create-unit-attribute.dto';
import { UpdateUnitAttributeDto } from './dto/update-unit-attribute.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UnitAttributeService {
  constructor(private prisma: PrismaService){}
  async create(createUnitAttributeDto: CreateUnitAttributeDto) {
    const uomExists = await this.prisma.uOM.findUnique({
      where: { id: createUnitAttributeDto.uomId },
    });

    if (!uomExists) {
      throw new NotFoundException('Unit attribute not found');
    }

    return this.prisma.uOMAttribute.create({
      data: {
        width: createUnitAttributeDto.width,
        height: createUnitAttributeDto.height,
        uomId: createUnitAttributeDto.uomId
      }
    })
  }

  findAll() {
    return this.prisma.uOMAttribute.findMany();
  }

  findOne(id: string) {
    return this.prisma.uOMAttribute.findUnique({
      where: {id},
    });
  }

  update(id: string, updateUnitAttributeDto: UpdateUnitAttributeDto) {
    return this.prisma.uOMAttribute.update({
      where: {id},
      data: {
        width: updateUnitAttributeDto.width,
        height: updateUnitAttributeDto.height
      }
    })
  }

  remove(id: string) {
    return this.prisma.uOMAttribute.delete({
      where: {id}
    })
  }
}
