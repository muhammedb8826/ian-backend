import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from '../entities/order.entity';
import { Pricing } from 'src/entities/pricing.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Pricing)
    private readonly pricingRepository: Repository<Pricing>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      // Validate pricingId for each orderItem
      const orderItemsWithPricing = createOrderDto.orderItems.filter(item => item.pricingId);
      for (const item of orderItemsWithPricing) {
        const pricingExists = await this.pricingRepository.findOne({
          where: { id: item.pricingId },
        });
        if (!pricingExists) {
          throw new ConflictException(`Pricing with id ${item.pricingId} not found.`);
        }
      }

      const order = this.orderRepository.create({
        series: createOrderDto.series,
        customerId: createOrderDto.customerId,
        status: createOrderDto.status,
        orderDate: new Date(createOrderDto.orderDate),
        deliveryDate: new Date(createOrderDto.deliveryDate),
        orderSource: createOrderDto.orderSource,
        totalAmount: parseFloat(createOrderDto.totalAmount.toString()),
        tax: parseFloat(createOrderDto.tax.toString()),
        grandTotal: parseFloat(createOrderDto.grandTotal.toString()),
        totalQuantity: parseFloat(createOrderDto.totalQuantity.toString()),
        internalNote: createOrderDto.internalNote,
        fileNames: createOrderDto.fileNames,
        adminApproval: createOrderDto.adminApproval,
        salesPartnersId: createOrderDto.salesPartner?.id,
      });

      return await this.orderRepository.save(order);
    } catch (error) {
      console.error('Error creating order:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }

      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }

    async findAll(skip: number, take: number, search?: string, startDate?: string, endDate?: string, item1?: string, item2?: string, item3?: string, status?: string) {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('order.paymentTerm', 'paymentTerm')
      .leftJoinAndSelect('order.commission', 'commission')
      .leftJoinAndSelect('order.salesPartner', 'salesPartner')
      .orderBy('order.createdAt', 'DESC')
      .skip(Number(skip))
      .take(Number(take));

    if (search) {
      queryBuilder.where(
        'order.id LIKE :search OR order.series LIKE :search OR customer.fullName LIKE :search OR customer.phone LIKE :search',
        { search: `%${search}%` }
      );
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('order.orderDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    if (item1) {
      queryBuilder.andWhere('orderItems.itemId = :item1', { item1 });
    }

    if (item2) {
      queryBuilder.andWhere('orderItems.itemId = :item2', { item2 });
    }

    if (item3) {
      queryBuilder.andWhere('orderItems.itemId = :item3', { item3 });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    const [orders, total] = await queryBuilder.getManyAndCount();

    // Calculate grand total sum
    const grandTotalSum = orders.reduce((sum, order) => sum + order.grandTotal, 0);

    return {
      orders,
      total,
      grandTotalSum,
    };
  }

  async findAllOrders() {
    return this.orderRepository.find({
      relations: ['customer', 'orderItems', 'paymentTerm', 'commission', 'salesPartner'],
    });
  }

  async findOne(id: string) {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'orderItems', 'paymentTerm', 'commission', 'salesPartner'],
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const existingOrder = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'orderItems', 'paymentTerm', 'commission', 'salesPartner'],
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    try {
      await this.orderRepository.update(id, {
        series: updateOrderDto.series,
        customerId: updateOrderDto.customerId,
        status: updateOrderDto.status,
        orderDate: updateOrderDto.orderDate ? new Date(updateOrderDto.orderDate) : undefined,
        deliveryDate: updateOrderDto.deliveryDate ? new Date(updateOrderDto.deliveryDate) : undefined,
        orderSource: updateOrderDto.orderSource,
        totalAmount: updateOrderDto.totalAmount ? parseFloat(updateOrderDto.totalAmount.toString()) : undefined,
        tax: updateOrderDto.tax ? parseFloat(updateOrderDto.tax.toString()) : undefined,
        grandTotal: updateOrderDto.grandTotal ? parseFloat(updateOrderDto.grandTotal.toString()) : undefined,
        totalQuantity: updateOrderDto.totalQuantity ? parseFloat(updateOrderDto.totalQuantity.toString()) : undefined,
        internalNote: updateOrderDto.internalNote,
        fileNames: updateOrderDto.fileNames,
        adminApproval: updateOrderDto.adminApproval,
        salesPartnersId: updateOrderDto.salesPartner?.id,
      });

      return await this.orderRepository.findOne({
        where: { id },
        relations: ['customer', 'orderItems', 'paymentTerm', 'commission', 'salesPartner'],
      });
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      
      return await this.orderRepository.remove(order);
    } catch (error) {
      console.log(error);
      throw new Error('An unexpected error occurred.');
    }
  }

  getPaymentTermStatus(remainingAmount: number, grandTotal: number) {
    if (remainingAmount === 0) {
      return 'Paid';
    } else if (remainingAmount < grandTotal) {
      return 'Partial';
    } else {
      return 'Pending';
    }
  }
}
