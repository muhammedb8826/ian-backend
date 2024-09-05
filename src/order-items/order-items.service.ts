import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderItemsService {
  constructor(private prisma: PrismaService) { }
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
          status: createOrderItemDto.status,
          pricingId: createOrderItemDto.pricingId,
          unit: parseFloat(createOrderItemDto.unit.toString()),
          baseUomId: createOrderItemDto.baseUomId,
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
      where: { orderId },
      include: {
        order: true,
        pricing: true,
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

    // if status is 'Printed' or 'Void', adjust the operatorStock first
    if (updateOrderItemDto.status === 'Printed' || updateOrderItemDto.status === 'Void') {
      const orderItem = await this.prisma.orderItems.findFirst({
        where: { id },
        include: { item: true },
      });

      if (orderItem) {
        const item = await this.prisma.items.findFirst({
          where: { id: orderItem.itemId },
        });

        if (item) {
          const operatorStock = await this.prisma.operatorStock.findFirst({
            where: { itemId: item.id },
          });

          // Throw an error if the operatorStock entry is not found
          if (!operatorStock) {
            throw new ConflictException(`Please make a request for item ${item.name} before trying to print` );
          }

          // Check if the stock quantity is sufficient
          if (operatorStock.quantity < orderItem.unit) {
            throw new ConflictException('Insufficient stock for this item.');
          }

          if (operatorStock) {
            await this.prisma.operatorStock.update({
              where: { id: operatorStock.id },
              data: { quantity: operatorStock.quantity - orderItem.unit },
            });
          }
        }
      }
    }

    // Check if status is 'Approved' and handle payment verification
    if (updateOrderItemDto.status === 'Approved') {
      const orderPayment = await this.prisma.paymentTerms.findFirst({
        where: { orderId: updateOrderItemDto.orderId },
        include: { order: true },
      });

      if (orderPayment) {
        const paymentTerm = await this.prisma.paymentTerms.findFirst({
          where: { id: orderPayment.id },
        });

        if (paymentTerm && paymentTerm.forcePayment && paymentTerm.remainingAmount > 0) {
          throw new ConflictException('Payment is not completed');
        }
      }
    }


    const updatedOrderItem = await this.prisma.orderItems.update({
      where: { id },
      data: {
        orderId: updateOrderItemDto.orderId,
        itemId: updateOrderItemDto.itemId,
        quantity: updateOrderItemDto.quantity,
        serviceId: updateOrderItemDto.serviceId,
        width: updateOrderItemDto.width !== null && updateOrderItemDto.width !== undefined
          ? parseFloat(updateOrderItemDto.width.toString())
          : null,
        height: updateOrderItemDto.height !== null && updateOrderItemDto.height !== undefined
          ? parseFloat(updateOrderItemDto.height.toString())
          : null,
        discount: parseFloat(updateOrderItemDto.discount.toString()),
        level: updateOrderItemDto.level,
        totalAmount: parseFloat(updateOrderItemDto.totalAmount.toString()),
        adminApproval: updateOrderItemDto.adminApproval,
        uomId: updateOrderItemDto.uomId,
        unitPrice: parseFloat(updateOrderItemDto.unitPrice.toString()),
        description: updateOrderItemDto.description,
        isDiscounted: updateOrderItemDto.isDiscounted,
        status: updateOrderItemDto.status,
        pricingId: updateOrderItemDto.pricingId,
        unit: parseFloat(updateOrderItemDto.unit.toString()),
        baseUomId: updateOrderItemDto.baseUomId,
      },
    });

    return updatedOrderItem;
  }

  async remove(id: string) {
    return this.prisma.orderItems.delete({
      where: { id }
    });
  }
}
