import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) { }

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
  
    // Check if an item with the same name already exists

    const normalizedAttribute = createItemDto.name.toLowerCase();
    const existingItem = await this.prisma.items.findUnique({
      where: { name: normalizedAttribute },
    });
  
    if (existingItem) {
      throw new ConflictException('An item with this name already exists.');
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
          quantity: createItemDto.quantity || 0,
          unitOfMeasure: createItemDto.unitOfMeasureId ? { connect: { id: createItemDto.unitOfMeasureId } } : undefined,
          purchaseUnitOfMeasure: createItemDto.purchaseUnitOfMeasureId ? { connect: { id: createItemDto.purchaseUnitOfMeasureId } } : undefined,
          machine: { connect: { id: createItemDto.machineId } },
          unitCategory: createItemDto.unitCategoryId ? { connect: { id: createItemDto.unitCategoryId } } : undefined, // Connect unitCategory
          services: {
            create: createItemDto.services?.map(service => ({
              name: service.name,
              description: service.description || '',
              status: service.status,
              sellingPrice: service.sellingPrice || 0,
            })) || []
          },
          discounts: {
            create: createItemDto.discounts?.map(discount => ({
              level: discount.level,
              quantity: discount.quantity || 0,
              percentage: discount.percentage || 0
            })) || []
          }
        },
        include: {
          unitOfMeasure: true,
          purchaseUnitOfMeasure: true,
          machine: true,
          services: true,
          discounts: true,
          unitCategory: true
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002': // Unique constraint violation
            const target = error.meta?.target;
            if (Array.isArray(target)) {
              if (target.includes('items_name_key')) {
                throw new ConflictException('An item with this name already exists.');
              } else if (target.includes('services_name_itemId_key')) {
                throw new ConflictException('A service with this name already exists for this item.');
              } else if (target.includes('discounts_level_itemId_key')) {
                throw new ConflictException('A discount with this level already exists for this item.');
              }
            }
            break;
          case 'P2003': // Foreign key constraint violation
            throw new ConflictException('Foreign key constraint failed.');
          case 'P2025': // Record not found
            throw new NotFoundException('The record you are trying to update or delete does not exist.');
          default:
            console.log(error);
            throw new Error('An unexpected error occurred.');
        }
      } else {
        console.log(error);
        throw new Error('An unexpected error occurred.');
      }
    }
  }

  async findAll(skip: number, take: number, search?: string) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.items.findMany({
        skip: Number(skip),
        take: Number(take),
        where: search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        include: {

        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.items.count({
        where: search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
      }),
    ]);
    return {
      items,
      total
    };
  }

  async findAllItems() {
    return this.prisma.items.findMany({
      include: {
        discounts: true,
        services: true,
        unitOfMeasure: true,
        purchaseUnitOfMeasure: true,
        machine: true,
        unitCategory: {
          include: {
            units: true
          }
        }
      }
    })
  }

  async findOne(id: string) {
    const item = await this.prisma.items.findUnique({
       where: { id },
       include: {
         discounts: true,
         services: true,
         unitOfMeasure: true,
         purchaseUnitOfMeasure: true,
         machine: true,
         unitCategory: {
          include: {
            units: true
          }
        }
       }
     });
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
      quantity: updateItemDto.quantity,
      unitOfMeasure: updateItemDto.unitOfMeasureId ? { connect: { id: updateItemDto.unitOfMeasureId } } : undefined,
      purchaseUnitOfMeasure: updateItemDto.purchaseUnitOfMeasureId ? { connect: { id: updateItemDto.purchaseUnitOfMeasureId } } : undefined,
      machine: updateItemDto.machineId ? { connect: { id: updateItemDto.machineId } } : undefined,
      unitCategory: updateItemDto.unitCategoryId ? { connect: { id: updateItemDto.unitCategoryId } } : undefined, // Connect unitCategory
      // Delete all existing services and discounts before adding/upserting
      services: {
        deleteMany: {},  // This deletes all existing services
        upsert: (updateItemDto.services || []).map(service => ({
          where: { id: service.id || '' },  // Ensure ID for existing service
          update: {
            name: service.name || 'Default Name',
            description: service.description || '',
            status: service.status ?? true,
            sellingPrice: service.sellingPrice ?? 0,
          },
          create: {
            name: service.name || 'Default Name',
            description: service.description || '',
            status: service.status ?? true,
            sellingPrice: service.sellingPrice ?? 0,
          },
        })),
      },
      discounts: {
        deleteMany: {},  // This deletes all existing discounts
        upsert: (updateItemDto.discounts || []).map(discount => ({
          where: { id: discount.id || '' },  // Ensure ID for existing discount
          update: {
            level: discount.level,
            quantity: discount.quantity ?? 0,
            percentage: discount.percentage ?? 0,
          },
          create: {
            level: discount.level ?? 0,
            quantity: discount.quantity ?? 0,
            percentage: discount.percentage ?? 0,
          },
        })),
      },
    };
  
    try {
      return await this.prisma.items.update({
        where: { id },
        data: updateData,
        include: {
          discounts: true,
          services: true,
          unitOfMeasure: true,
          purchaseUnitOfMeasure: true,
          machine: true,
          unitCategory: true
        },
      });
    } catch (error) {
      if (error.code === 'P2002') { // Prisma unique constraint error code
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }
      else if (error.code === 'P2003') {
        throw new ConflictException('Foreign key constraint failed.');
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(`Validation error: ${error.message}`);
      } else {
        throw new Error('An unexpected error occurred.');
      }
    }
  }
  

  async remove(id: string) {
    const item = await this.prisma.items.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    try {
      return await this.prisma.items.delete({
        where: { id },
        include: {
          services: true,
          discounts: true
        }
      });
    } catch (error) {
      if (error.code === 'P2003') { // P2003 is Prisma's foreign key constraint error code
        throw new BadRequestException('Cannot delete item due to existing dependencies. Please remove associated data first.');
      }
      throw error; // Rethrow other errors
    }
  }
}
