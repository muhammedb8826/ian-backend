import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from '../entities/order.entity';
import { Pricing } from 'src/entities/pricing.entity';
import { OrderItems } from 'src/entities/order-item.entity';
import { PaymentTerm } from 'src/entities/payment-term.entity';
import { PaymentTransaction } from 'src/entities/payment-transaction.entity';
import { Commission } from 'src/entities/commission.entity';
import { CommissionTransaction } from 'src/entities/commission-transaction.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Pricing)
    private readonly pricingRepository: Repository<Pricing>,
    @InjectRepository(OrderItems)
    private readonly orderItemsRepository: Repository<OrderItems>,
    @InjectRepository(PaymentTerm)
    private readonly paymentTermRepository: Repository<PaymentTerm>,
    @InjectRepository(PaymentTransaction)
    private readonly paymentTransactionRepository: Repository<PaymentTransaction>,
    @InjectRepository(Commission)
    private readonly commissionRepository: Repository<Commission>,
    @InjectRepository(CommissionTransaction)
    private readonly commissionTransactionRepository: Repository<CommissionTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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

      // Create the main order
      const order = this.orderRepository.create({
        series: createOrderDto.series,
        customerId: createOrderDto.customerId,
        status: createOrderDto.status,
        orderDate: createOrderDto.orderDate ? new Date(createOrderDto.orderDate) : new Date(),
        deliveryDate: createOrderDto.deliveryDate ? new Date(createOrderDto.deliveryDate) : new Date(),
        orderSource: createOrderDto.orderSource,
        totalAmount: parseFloat((createOrderDto.totalAmount || 0).toString()),
        tax: parseFloat((createOrderDto.tax || 0).toString()),
        grandTotal: parseFloat((createOrderDto.grandTotal || 0).toString()),
        totalQuantity: parseFloat((createOrderDto.totalQuantity || 0).toString()),
        internalNote: createOrderDto.internalNote,
        fileNames: createOrderDto.fileNames || [],
        adminApproval: createOrderDto.adminApproval || false,
        salesPartnersId: createOrderDto.salesPartner?.id,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Create order items
      const orderItems = createOrderDto.orderItems.map(item =>
        this.orderItemsRepository.create({
          orderId: savedOrder.id,
          itemId: item.itemId,
          serviceId: item.serviceId,
          width: item.width ? parseFloat(item.width.toString()) : null,
          height: item.height ? parseFloat(item.height.toString()) : null,
          discount: parseFloat((item.discount || 0).toString()),
          level: parseFloat((item.level || 0).toString()),
          totalAmount: parseFloat((item.totalAmount || 0).toString()),
          adminApproval: item.adminApproval || false,
          uomId: item.uomId,
          quantity: parseFloat((item.quantity || 0).toString()),
          unitPrice: parseFloat((item.unitPrice || 0).toString()),
          description: item.description,
          isDiscounted: item.isDiscounted || false,
          status: item.status,
          pricingId: item.pricingId,
          unit: parseFloat((item.unit || 0).toString()),
          baseUomId: item.baseUomId,
        })
      );

      await queryRunner.manager.save(OrderItems, orderItems);

      // Create payment term if provided
      if (createOrderDto.paymentTerm) {
        const paymentTerm = this.paymentTermRepository.create({
          orderId: savedOrder.id,
          totalAmount: parseFloat((createOrderDto.paymentTerm.totalAmount || 0).toString()),
          remainingAmount: parseFloat((createOrderDto.paymentTerm.remainingAmount || 0).toString()),
          status: this.getPaymentTermStatus(createOrderDto.paymentTerm.remainingAmount || 0, createOrderDto.grandTotal),
          forcePayment: createOrderDto.paymentTerm.forcePayment || false,
        });

        const savedPaymentTerm = await queryRunner.manager.save(PaymentTerm, paymentTerm);

        // Create payment transactions if provided
        if (createOrderDto.paymentTerm.transactions?.length > 0) {
          const paymentTransactions = createOrderDto.paymentTerm.transactions.map(transaction =>
            this.paymentTransactionRepository.create({
              paymentTermId: savedPaymentTerm.id,
              date: transaction.date ? new Date(transaction.date) : new Date(),
              paymentMethod: transaction.paymentMethod,
              reference: transaction.reference,
              amount: parseFloat((transaction.amount || 0).toString()),
              status: transaction.status,
              description: transaction.description,
            })
          );

          await queryRunner.manager.save(PaymentTransaction, paymentTransactions);
        }
      }

      // Create commission if provided
      if (createOrderDto.commission) {
        const commission = this.commissionRepository.create({
          orderId: savedOrder.id,
          salesPartnerId: createOrderDto.commission.salesPartnerId,
          totalAmount: parseFloat((createOrderDto.commission.totalAmount || 0).toString()),
          paidAmount: parseFloat((createOrderDto.commission.paidAmount || 0).toString()),
        });

        const savedCommission = await queryRunner.manager.save(Commission, commission);

        // Create commission transactions if provided
        if (createOrderDto.commission.transactions?.length > 0) {
          const commissionTransactions = createOrderDto.commission.transactions.map(transaction =>
            this.commissionTransactionRepository.create({
              commissionId: savedCommission.id,
              date: transaction.date ? new Date(transaction.date) : new Date(),
              amount: parseFloat((transaction.amount || 0).toString()),
              percentage: parseFloat((transaction.percentage || 0).toString()),
              paymentMethod: transaction.paymentMethod,
              reference: transaction.reference,
              status: transaction.status,
              description: transaction.description,
            })
          );

          await queryRunner.manager.save(CommissionTransaction, commissionTransactions);
        }
      }

      await queryRunner.commitTransaction();

      // Return the complete order with all relations
      return await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: [
          'customer', 
          'orderItems', 
          'paymentTerm', 
          'paymentTerm.transactions',
          'commission', 
          'commission.transactions',
          'salesPartner'
        ],
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating order:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }

      throw new Error(`An unexpected error occurred: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(skip: number, take: number, search?: string, startDate?: string, endDate?: string, item1?: string, item2?: string, item3?: string) {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.pricing', 'orderItemsPricing')
      .leftJoinAndSelect('order.paymentTerm', 'paymentTerm')
      .leftJoinAndSelect('paymentTerm.transactions', 'paymentTransactions')
      .leftJoinAndSelect('order.commission', 'commission')
      .leftJoinAndSelect('commission.transactions', 'commissionTransactions')
      .leftJoinAndSelect('order.salesPartner', 'salesPartner')
      .orderBy('order.createdAt', 'DESC')
      .skip(Number(skip))
      .take(Number(take));

    // Handle search filter
    if (search) {
      queryBuilder.where(
        '(order.id LIKE :search OR order.series LIKE :search OR customer.fullName LIKE :search OR customer.phone LIKE :search OR orderItems.description LIKE :search OR paymentTransactions.reference LIKE :search OR commissionTransactions.reference LIKE :search OR salesPartner.fullName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Handle date range filter
    if (startDate && endDate) {
      queryBuilder.andWhere('order.orderDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    // Collect the provided item names into an array
    const orderItemNames = [item1, item2, item3].filter(Boolean);

    // Handle order item names filter
    if (orderItemNames.length > 0) {
      const itemConditions = orderItemNames.map((name, index) => 
        `orderItems.item.name LIKE :item${index}`
      ).join(' OR ');
      
      queryBuilder.andWhere(`(${itemConditions})`);
      
      orderItemNames.forEach((name, index) => {
        queryBuilder.setParameter(`item${index}`, `%${name}%`);
      });
    }

    const [orders, total] = await queryBuilder.getManyAndCount();

    // Calculate grand total sum using a separate query for better performance
    const grandTotalQuery = this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.grandTotal)', 'grandTotalSum');

    // Apply the same filters to the sum query
    if (search) {
      grandTotalQuery.where(
        '(order.id LIKE :search OR order.series LIKE :search OR customer.fullName LIKE :search OR customer.phone LIKE :search OR orderItems.description LIKE :search OR paymentTransactions.reference LIKE :search OR commissionTransactions.reference LIKE :search OR salesPartner.fullName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (startDate && endDate) {
      grandTotalQuery.andWhere('order.orderDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    if (orderItemNames.length > 0) {
      const itemConditions = orderItemNames.map((name, index) => 
        `orderItems.item.name LIKE :item${index}`
      ).join(' OR ');
      
      grandTotalQuery.andWhere(`(${itemConditions})`);
      
      orderItemNames.forEach((name, index) => {
        grandTotalQuery.setParameter(`item${index}`, `%${name}%`);
      });
    }

    const grandTotalResult = await grandTotalQuery.getRawOne();
    const grandTotalSum = grandTotalResult?.grandTotalSum || 0;

    return {
      orders,
      total,
      grandTotalSum,
    };
  }

  async findAllOrders() {
    return this.orderRepository.find({
      relations: [
        'customer', 
        'orderItems', 
        'orderItems.pricing',
        'paymentTerm', 
        'paymentTerm.transactions',
        'commission', 
        'commission.transactions',
        'commission.salesPartner',
        'salesPartner'
      ],
      order: {
        createdAt: 'DESC',
        orderItems: {
          createdAt: 'DESC'
        }
      }
    });
  }

  async findOne(id: string) {
    return this.orderRepository.findOne({
      where: { id },
      relations: [
        'customer', 
        'orderItems', 
        'orderItems.pricing',
        'paymentTerm', 
        'paymentTerm.transactions',
        'commission', 
        'commission.transactions',
        'commission.salesPartner',
        'salesPartner'
      ],
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const { orderItems, paymentTerm, commission, salesPartner, ...orderData } = updateOrderDto;

    // Fetch the existing order and related data
    const existingOrder = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'orderItems',
        'paymentTerm', 
        'paymentTerm.transactions',
        'commission', 
        'commission.transactions',
        'commission.salesPartner',
        'salesPartner'
      ],
    });

    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Validate missing fields for commission
    if (commission) {
      if (!commission.salesPartnerId) {
        throw new ConflictException('Sales partner for commission is missing.');
      }
      if (!commission.transactions || commission.transactions.length === 0) {
        throw new ConflictException('Commission transactions are missing.');
      }
      commission.transactions.forEach((transaction, index) => {
        if (!transaction.paymentMethod) {
          throw new ConflictException(`Payment method for commission transaction #${index + 1} is missing.`);
        }
        if (transaction.amount === null || transaction.amount === 0) {
          throw new ConflictException(`Amount for commission transaction #${index + 1} is missing.`);
        }
        if (transaction.percentage === null || transaction.percentage === 0) {
          throw new ConflictException(`Percentage for commission transaction #${index + 1} is missing.`);
        }
        if (transaction.date === null) {
          throw new ConflictException(`Date for commission transaction #${index + 1} is missing.`);
        }
        if (transaction.reference === null) {
          throw new ConflictException(`Reference for commission transaction #${index + 1} is missing.`);
        }
        if (transaction.status === null) {
          throw new ConflictException(`Status for commission transaction #${index + 1} is missing.`);
        }
      });
    }

    // Validate missing fields for paymentTerm
    if (paymentTerm) {
      if (!paymentTerm.transactions || paymentTerm.transactions.length === 0) {
        throw new BadRequestException('Payment term transactions are missing.');
      }
      paymentTerm.transactions.forEach((transaction, index) => {
        if (!transaction.paymentMethod) {
          throw new BadRequestException(`Payment method for payment term transaction #${index + 1} is missing.`);
        }
      });
    }

    // Extract existing IDs for comparison
    const existingOrderItemIds = existingOrder.orderItems.map(item => item.id);
    const newOrderItemIds = orderItems.map(item => item.id);
    const orderItemsToDelete = existingOrderItemIds.filter(id => !newOrderItemIds.includes(id));

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update the main order
      await queryRunner.manager.update(Order, id, {
        series: orderData.series,
        customerId: orderData.customerId,
        status: orderData.status,
        orderDate: orderData.orderDate ? new Date(orderData.orderDate) : new Date(),
        deliveryDate: orderData.deliveryDate ? new Date(orderData.deliveryDate) : new Date(),
        orderSource: orderData.orderSource,
        totalAmount: parseFloat((orderData.totalAmount || 0).toString()),
        tax: parseFloat((orderData.tax || 0).toString()),
        grandTotal: parseFloat((orderData.grandTotal || 0).toString()),
        totalQuantity: parseFloat((orderData.totalQuantity || 0).toString()),
        internalNote: orderData.internalNote,
        fileNames: orderData.fileNames || [],
        adminApproval: orderData.adminApproval || false,
        salesPartnersId: salesPartner?.id,
      });

      // Delete order items that are no longer present
      if (orderItemsToDelete.length > 0) {
        await queryRunner.manager.delete(OrderItems, { id: In(orderItemsToDelete) });
      }

      // Upsert order items
      for (const item of orderItems) {
        if (item.id) {
          // Update existing order item
          await queryRunner.manager.update(OrderItems, item.id, {
            itemId: item.itemId,
            serviceId: item.serviceId,
            width: item.width !== null ? parseFloat(item.width.toString()) : null,
            height: item.height !== null ? parseFloat(item.height.toString()) : null,
            discount: parseFloat((item.discount || 0).toString()),
            level: parseFloat((item.level || 0).toString()),
            totalAmount: parseFloat((item.totalAmount || 0).toString()),
            adminApproval: item.adminApproval || false,
            uomId: item.uomId,
            quantity: parseFloat((item.quantity || 0).toString()),
            unitPrice: parseFloat((item.unitPrice || 0).toString()),
            description: item.description,
            isDiscounted: item.isDiscounted || false,
            status: item.status,
            pricingId: item.pricingId,
            unit: parseFloat((item.unit || 0).toString()),
            baseUomId: item.baseUomId,
          });
        } else {
          // Create new order item
          await queryRunner.manager.save(OrderItems, {
            orderId: id,
            itemId: item.itemId,
            serviceId: item.serviceId,
            width: item.width !== null ? parseFloat(item.width.toString()) : null,
            height: item.height !== null ? parseFloat(item.height.toString()) : null,
            discount: parseFloat((item.discount || 0).toString()),
            level: parseFloat((item.level || 0).toString()),
            totalAmount: parseFloat((item.totalAmount || 0).toString()),
            adminApproval: item.adminApproval || false,
            uomId: item.uomId,
            quantity: parseFloat((item.quantity || 0).toString()),
            unitPrice: parseFloat((item.unitPrice || 0).toString()),
            description: item.description,
            isDiscounted: item.isDiscounted || false,
            status: item.status,
            pricingId: item.pricingId,
            unit: parseFloat((item.unit || 0).toString()),
            baseUomId: item.baseUomId,
          });
        }
      }

      // Handle payment term
      if (paymentTerm) {
        // Delete existing payment term and transactions if they exist
        if (existingOrder.paymentTerm && existingOrder.paymentTerm.length > 0) {
          await queryRunner.manager.delete(PaymentTransaction, { paymentTermId: existingOrder.paymentTerm[0].id });
          await queryRunner.manager.delete(PaymentTerm, { id: existingOrder.paymentTerm[0].id });
        }

        // Create new payment term
        const newPaymentTerm = await queryRunner.manager.save(PaymentTerm, {
          orderId: id,
          totalAmount: parseFloat((paymentTerm.totalAmount || 0).toString()),
          remainingAmount: parseFloat((paymentTerm.remainingAmount || 0).toString()),
          status: this.getPaymentTermStatus(paymentTerm.remainingAmount || 0, orderData.grandTotal || 0),
          forcePayment: paymentTerm.forcePayment || false,
        });

        // Create payment transactions
        if (paymentTerm.transactions?.length > 0) {
          const paymentTransactions = paymentTerm.transactions.map(transaction =>
            this.paymentTransactionRepository.create({
              paymentTermId: newPaymentTerm.id,
              date: transaction.date ? new Date(transaction.date) : new Date(),
              paymentMethod: transaction.paymentMethod,
              reference: transaction.reference,
              amount: parseFloat((transaction.amount || 0).toString()),
              status: transaction.status ? 'Paid' : 'Pending',
              description: transaction.description,
            })
          );

          await queryRunner.manager.save(PaymentTransaction, paymentTransactions);
        }
      }

      // Handle commission
      if (commission) {
        // Delete existing commission and transactions if they exist
        if (existingOrder.commission && existingOrder.commission.length > 0) {
          await queryRunner.manager.delete(CommissionTransaction, { commissionId: existingOrder.commission[0].id });
          await queryRunner.manager.delete(Commission, { id: existingOrder.commission[0].id });
        }

        // Create new commission
        const newCommission = await queryRunner.manager.save(Commission, {
          orderId: id,
          salesPartnerId: commission.salesPartnerId,
          totalAmount: parseFloat((commission.totalAmount || 0).toString()),
          paidAmount: parseFloat((commission.paidAmount || 0).toString()),
        });

        // Create commission transactions
        if (commission.transactions?.length > 0) {
          const commissionTransactions = commission.transactions.map(transaction =>
            this.commissionTransactionRepository.create({
              commissionId: newCommission.id,
              date: transaction.date ? new Date(transaction.date) : new Date(),
              amount: parseFloat((transaction.amount || 0).toString()),
              percentage: parseFloat((transaction.percentage || 0).toString()),
              paymentMethod: transaction.paymentMethod,
              reference: transaction.reference,
              status: transaction.status,
              description: transaction.description,
            })
          );

          await queryRunner.manager.save(CommissionTransaction, commissionTransactions);
        }
      }

      await queryRunner.commitTransaction();

      // Return the updated order with all relations
      return await this.orderRepository.findOne({
        where: { id },
        relations: [
          'customer',
          'orderItems',
          'orderItems.pricing',
          'paymentTerm',
          'paymentTerm.transactions',
          'commission',
          'commission.transactions',
          'commission.salesPartner',
          'salesPartner'
        ],
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Unique constraint violation: An order with the same item and service already exists.');
      }
      
      console.error('Error updating order:', error);
      throw new BadRequestException('Failed to update order');
    } finally {
      await queryRunner.release();
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
    if (remainingAmount > 0 && remainingAmount < grandTotal) {
      return 'Partially Paid';
    } else if (remainingAmount === 0) {
      return 'Fully Paid';
    } else if (remainingAmount === grandTotal) {
      return 'Not Paid';
    }
  }
}
