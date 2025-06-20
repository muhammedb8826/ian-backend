import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItems } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItems)
    private readonly orderItemRepository: Repository<OrderItems>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createOrderItemDto: CreateOrderItemDto) {
    try {
      // Create the order item
      const orderItem = this.orderItemRepository.create({
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
      });

      const createdOrderItem = await this.orderItemRepository.save(orderItem);

      // After creating the order item, fetch all related order items
      const orderItems = await this.orderItemRepository.find({
        where: { orderId: createOrderItemDto.orderId },
      });

      // Check if all statuses are the same or partially complete
      const allReceived = orderItems.every(item => item.status === 'Received');
      const allPrinted = orderItems.every(item => item.status === 'Printed');
      const allCompleted = orderItems.every(item => item.status === 'Completed');
      const allDelivered = orderItems.every(item => item.status === 'Delivered');

      let newOrderStatus = 'Processing'; // Default status

      if (allReceived) {
        newOrderStatus = 'Pending';
      } else if (allPrinted) {
        newOrderStatus = 'Printed';
      } else if (allCompleted) {
        newOrderStatus = 'Completed';
      } else if (allDelivered) {
        newOrderStatus = 'Delivered';
      }

      // Update the order with the new status
      await this.orderRepository.update(createOrderItemDto.orderId, { status: newOrderStatus });

      return createdOrderItem;
    } catch (error) {
      console.error('Error creating order item:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }

      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }

  async findAll(orderId: string) {
    const orderItems = await this.orderItemRepository.find({
      where: { orderId },
      relations: ['order', 'uom', 'pricing', 'item', 'service', 'orderItemNotes', 'orderItemNotes.user'],
    });

    return orderItems;
  }

  async findAllOrderItems(skip: number, take: number, search?: string, startDate?: string, endDate?: string, item?: string, status?: string) {
    const queryBuilder = this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('orderItem.uom', 'uom')
      .leftJoinAndSelect('orderItem.pricing', 'pricing')
      .leftJoinAndSelect('orderItem.item', 'item')
      .leftJoinAndSelect('orderItem.service', 'service')
      .leftJoinAndSelect('orderItem.orderItemNotes', 'orderItemNotes')
      .leftJoinAndSelect('orderItemNotes.user', 'user')
      .orderBy('orderItem.createdAt', 'DESC')
      .skip(Number(skip))
      .take(Number(take));

    // Search filter for series, fullName, or phone
    if (search) {
      queryBuilder.where(
        'order.series LIKE :search OR customer.fullName LIKE :search OR customer.phone LIKE :search OR customer.email LIKE :search',
        { search: `%${search}%` }
      );
    }

    // Filter by start and end dates
    if (startDate && endDate) {
      queryBuilder.andWhere('order.orderDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    if (item) {
      queryBuilder.andWhere('item.name LIKE :item', { item: `%${item}%` });
    }

    if (status) {
      queryBuilder.andWhere('orderItem.status = :status', { status });
    }

    const [orderItems, total] = await queryBuilder.getManyAndCount();

    // Calculate total amount sum
    const totalAmountSum = orderItems.reduce((sum, orderItem) => sum + orderItem.totalAmount, 0);

    return {
      orderItems,
      total,
      totalAmountSum,
    };
  }

  async findOne(id: string) {
    return this.orderItemRepository.findOne({
      where: { id },
      relations: ['order', 'uom', 'pricing', 'item', 'service', 'orderItemNotes', 'orderItemNotes.user'],
    });
  }

  async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
    try {
      await this.orderItemRepository.update(id, {
        itemId: updateOrderItemDto.itemId,
        quantity: updateOrderItemDto.quantity ? parseFloat(updateOrderItemDto.quantity.toString()) : undefined,
        serviceId: updateOrderItemDto.serviceId,
        width: updateOrderItemDto.width ? parseFloat(updateOrderItemDto.width.toString()) : undefined,
        height: updateOrderItemDto.height ? parseFloat(updateOrderItemDto.height.toString()) : undefined,
        discount: updateOrderItemDto.discount,
        level: updateOrderItemDto.level,
        totalAmount: updateOrderItemDto.totalAmount ? parseFloat(updateOrderItemDto.totalAmount.toString()) : undefined,
        adminApproval: updateOrderItemDto.adminApproval,
        uomId: updateOrderItemDto.uomId,
        unitPrice: updateOrderItemDto.unitPrice ? parseFloat(updateOrderItemDto.unitPrice.toString()) : undefined,
        description: updateOrderItemDto.description,
        isDiscounted: updateOrderItemDto.isDiscounted,
        status: updateOrderItemDto.status,
        pricingId: updateOrderItemDto.pricingId,
        unit: updateOrderItemDto.unit ? parseFloat(updateOrderItemDto.unit.toString()) : undefined,
        baseUomId: updateOrderItemDto.baseUomId,
      });

      // Get the updated order item to check order status
      const updatedOrderItem = await this.orderItemRepository.findOne({
        where: { id },
        relations: ['order'],
      });

      if (updatedOrderItem) {
        // Fetch all order items for this order
        const orderItems = await this.orderItemRepository.find({
          where: { orderId: updatedOrderItem.orderId },
        });

        // Check if all statuses are the same
        const allReceived = orderItems.every(item => item.status === 'Received');
        const allPrinted = orderItems.every(item => item.status === 'Printed');
        const allCompleted = orderItems.every(item => item.status === 'Completed');
        const allDelivered = orderItems.every(item => item.status === 'Delivered');

        let newOrderStatus = 'Processing';

        if (allReceived) {
          newOrderStatus = 'Pending';
        } else if (allPrinted) {
          newOrderStatus = 'Printed';
        } else if (allCompleted) {
          newOrderStatus = 'Completed';
        } else if (allDelivered) {
          newOrderStatus = 'Delivered';
        }

        // Update the order status
        await this.orderRepository.update(updatedOrderItem.orderId, { status: newOrderStatus });
      }

      return await this.orderItemRepository.findOne({
        where: { id },
        relations: ['order', 'uom', 'pricing', 'item', 'service', 'orderItemNotes', 'orderItemNotes.user'],
      });
    } catch (error) {
      console.error('Error updating order item:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }

      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const orderItem = await this.orderItemRepository.findOne({
        where: { id },
        relations: ['order'],
      });

      if (!orderItem) {
        throw new Error('Order item not found');
      }

      const orderId = orderItem.orderId;

      // Delete the order item
      await this.orderItemRepository.remove(orderItem);

      // Fetch remaining order items for this order
      const remainingOrderItems = await this.orderItemRepository.find({
        where: { orderId },
      });

      // Update order status based on remaining items
      if (remainingOrderItems.length > 0) {
        const allReceived = remainingOrderItems.every(item => item.status === 'Received');
        const allPrinted = remainingOrderItems.every(item => item.status === 'Printed');
        const allCompleted = remainingOrderItems.every(item => item.status === 'Completed');
        const allDelivered = remainingOrderItems.every(item => item.status === 'Delivered');

        let newOrderStatus = 'Processing';

        if (allReceived) {
          newOrderStatus = 'Pending';
        } else if (allPrinted) {
          newOrderStatus = 'Printed';
        } else if (allCompleted) {
          newOrderStatus = 'Completed';
        } else if (allDelivered) {
          newOrderStatus = 'Delivered';
        }

        await this.orderRepository.update(orderId, { status: newOrderStatus });
      }

      return { message: 'Order item deleted successfully' };
    } catch (error) {
      console.error('Error removing order item:', error);
      throw new Error('An unexpected error occurred.');
    }
  }
}
