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
          quantity: parseFloat(createOrderItemDto.quantity.toString()),
          serviceId: createOrderItemDto.serviceId,
          width: parseFloat(createOrderItemDto.width.toString()),
          height: parseFloat(createOrderItemDto.height.toString()),
          discount: createOrderItemDto.discount,
          level: createOrderItemDto.level,
          totalAmount: parseFloat(createOrderItemDto.totalAmount.toString()),
          adminApproval: createOrderItemDto.adminApproval,
          uomId: createOrderItemDto.uomId,
          unitPrice: parseFloat(createOrderItemDto.unitPrice.toString()),
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

  async findAll(orderId: string) {
    const orderItems = await this.prisma.orderItems.findMany({
      where: {orderId},
      include: {
        order: true,
        item: true,
        orderItemNotes: {
          include: {
            user: true,
          }
        }
      }
    });

    return orderItems;
  }


  async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
    const updatedOrderItem = await this.prisma.orderItems.update({
      where: { id },
      data: {
        orderId: updateOrderItemDto.orderId,
        itemId: updateOrderItemDto.itemId,
        quantity: updateOrderItemDto.quantity,
        serviceId: updateOrderItemDto.serviceId,
        width: parseFloat(updateOrderItemDto.width.toString()),
        height: parseFloat(updateOrderItemDto.height.toString()),
        discount: parseFloat(updateOrderItemDto.discount.toString()),
        level: updateOrderItemDto.level,
        totalAmount: parseFloat(updateOrderItemDto.totalAmount.toString()),
        adminApproval: updateOrderItemDto.adminApproval,
        uomId: updateOrderItemDto.uomId,
        unitPrice: parseFloat(updateOrderItemDto.unitPrice.toString()),
        description: updateOrderItemDto.description,
        isDiscounted: updateOrderItemDto.isDiscounted,
        status: updateOrderItemDto.status,
      },
    });
  
    // Check if the status is 'Approved' and handle payment verification
    if (updateOrderItemDto.status === 'Approved') {
      const orderPayment = await this.prisma.paymentTerms.findFirst({
        where: { orderId: updateOrderItemDto.orderId },
        include: {
          order: true,
        },
      });
  
      if (orderPayment) {
        const paymentTerm = await this.prisma.paymentTerms.findFirst({
          where: { id: orderPayment.id },
        });
  
        if (paymentTerm) {
          if (paymentTerm.forcePayment === true && paymentTerm.remainingAmount > 0) {
            throw new ConflictException('Payment is not completed');
          }
        }
      }
    }
  
    return updatedOrderItem;
  }

  async remove(id: string) {
    return this.prisma.orderItems.delete({
      where: {id}
    });
  }
}
