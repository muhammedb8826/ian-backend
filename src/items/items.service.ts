import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}
  async create(createItemDto: CreateItemDto) {
    return this.prisma.items.create({
      data: createItemDto
    })
  }

  async findAll() {
    return this.prisma.items.findMany()
  }

  async findOne(id: string) {
    const item = await this.prisma.items.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto) {
    const item = await this.prisma.items.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return this.prisma.items.update({
      where: { id },
      data: updateItemDto,
    });
  }

  async remove(id: string) {
    const item = await this.prisma.items.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return this.prisma.items.delete({ where: { id } });
  }
}
