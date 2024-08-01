import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}
  
  async create(createItemDto: CreateItemDto) {
    if (!createItemDto.machineId) {
      throw new ConflictException('Machine ID is required.');
    }

    // Check if the machine exists
    const machineExists = await this.prisma.machines.findUnique({
      where: { id: createItemDto.machineId },
    });

    if (!machineExists) {
      throw new ConflictException('Machine ID does not exist.');
    }

    try {
      return await this.prisma.items.create({
        data: {
          name: createItemDto.name,
          description: createItemDto.description || '',
          reorder_level: createItemDto.reorder_level || 0,
          initial_stock: createItemDto.initial_stock || 0,
          updated_initial_stock: createItemDto.updated_initial_stock || 0,
          can_be_sold: createItemDto.can_be_sold || false,
          can_be_purchased: createItemDto.can_be_purchased || false,
          purchase_price: createItemDto.purchase_price || 0,
          selling_price: createItemDto.selling_price || 0,
          unitOfMeasure: createItemDto.unitOfMeasureId ? { connect: { id: createItemDto.unitOfMeasureId } } : undefined,
          purchaseUnitOfMeasure: createItemDto.purchaseUnitOfMeasureId ? { connect: { id: createItemDto.purchaseUnitOfMeasureId } } : undefined,
          machine: { connect: { id: createItemDto.machineId } },
        },
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new ConflictException('Foreign key constraint failed.');
      }
      throw error;
    }
  }


  async findAll(skip: number, take: number) {
   const [items, total] = await this.prisma.$transaction([
      this.prisma.items.findMany({
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.items.count()
    ])
    return {
      items,
      total
    }
  }

  async findAllItems() {
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

    const updateData: Prisma.itemsUpdateInput = {
      name: updateItemDto.name,
      description: updateItemDto.description,
      reorder_level: updateItemDto.reorder_level,
      initial_stock: updateItemDto.initial_stock,
      updated_initial_stock: updateItemDto.updated_initial_stock,
      can_be_sold: updateItemDto.can_be_sold,
      can_be_purchased: updateItemDto.can_be_purchased,
      purchase_price: updateItemDto.purchase_price,
      selling_price: updateItemDto.selling_price,
      unitOfMeasure: updateItemDto.unitOfMeasureId ? { connect: { id: updateItemDto.unitOfMeasureId } } : undefined,
      purchaseUnitOfMeasure: updateItemDto.purchaseUnitOfMeasureId ? { connect: { id: updateItemDto.purchaseUnitOfMeasureId } } : undefined,
      machine: updateItemDto.machineId ? { connect: { id: updateItemDto.machineId } } : undefined,
    };

    return this.prisma.items.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const item = await this.prisma.items.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    try {
      return await this.prisma.items.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2003') { // P2003 is Prisma's foreign key constraint error code
        throw new BadRequestException('Cannot delete item due to existing dependencies. Please remove associated data first.');
      }
      throw error; // Rethrow other errors
    }
  }
}
