import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderItemsService {
  constructor(private prisma: PrismaService){}
  async create(createOrderItemDto: CreateOrderItemDto) {
    try {
      return await this.prisma.orderItems.create({
        data: {
          orderId: createOrderItemDto.orderId,
          itemId: createOrderItemDto.itemId,
          quantity: createOrderItemDto.quantity,
          serviceId: createOrderItemDto.serviceId,
          width: parseFloat(createOrderItemDto.width.toString()),
          height: parseFloat(createOrderItemDto.height.toString()),
          discount: createOrderItemDto.discount,
          level: createOrderItemDto.level,
          totalAmount: createOrderItemDto.totalAmount,
          adminApproval: createOrderItemDto.adminApproval,
          uomId: createOrderItemDto.uomId,
          unitPrice: createOrderItemDto.unitPrice,
          description: createOrderItemDto.description,
          isDiscounted: createOrderItemDto.isDiscounted,
          status: createOrderItemDto.status
        }
      })
    } catch (error) {
      console.error('Error creating payment items:', error);
  
      // Check for Prisma unique constraint error
      if (error.code === 'P2002') {
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }
  
      // Prisma-specific error details
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error details:', error.meta);
      }
  
      // General error handling
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }

  }

  async findAll() {
    return this.prisma.orderItems.findMany({
      include: {
        order: true,
        item: {
          include: {
            services: true,
            unitCategory: {
              include: {
                units: true
              }
            }
          }
        },
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.orderItems.findUnique({
      where: {id},
      include: {
        order: true,
        item: {
          include: {
            services: true,
            unitCategory: {
              include: {
                units: true
              }
            }
          }
        },
      }
    })
  }

  async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
   return this.prisma.orderItems.update({
      where: {id},
      data: {
        orderId: updateOrderItemDto.orderId,
        itemId: updateOrderItemDto.itemId,
        quantity: updateOrderItemDto.quantity,
        serviceId: updateOrderItemDto.serviceId,
        width: parseFloat(updateOrderItemDto.width.toString()),
        height: parseFloat(updateOrderItemDto.height.toString()),
        discount: updateOrderItemDto.discount,
        level: updateOrderItemDto.level,
        totalAmount: updateOrderItemDto.totalAmount,
        adminApproval: updateOrderItemDto.adminApproval,
        uomId: updateOrderItemDto.uomId,
        unitPrice: updateOrderItemDto.unitPrice,
        description: updateOrderItemDto.description,
        isDiscounted: updateOrderItemDto.isDiscounted,
        status: updateOrderItemDto.status
      }
    })
  }

  async remove(id: string) {
    return this.prisma.orderItems.delete({
      where: {id}
    });
  }
}
