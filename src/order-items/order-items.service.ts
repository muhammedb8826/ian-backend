import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItems } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';
import { OperatorStock } from 'src/entities/operator-stock.entity';
import { PaymentTerm } from 'src/entities/payment-term.entity';
import { OrderItemComponent } from 'src/entities/order-item-component.entity';
import { CreateOrderItemComponentDto } from './dto/create-order-item-component.dto';
import { RecordProductionDto } from './dto/record-production.dto';
import { RecordPrintDto } from './dto/record-print.dto';
import { RecordStepQuantityDto } from './dto/record-step-quantity.dto';
import { BomService } from 'src/bom/bom.service';
import { OrderItemEvent, OrderItemEventType } from 'src/entities/order-item-event.entity';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItems)
    private readonly orderItemsRepository: Repository<OrderItems>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OperatorStock)
    private readonly operatorStockRepository: Repository<OperatorStock>,
    @InjectRepository(PaymentTerm)
    private readonly paymentTermRepository: Repository<PaymentTerm>,
    @InjectRepository(OrderItemComponent)
    private readonly orderItemComponentRepository: Repository<OrderItemComponent>,
    @InjectRepository(OrderItemEvent)
    private readonly orderItemEventRepository: Repository<OrderItemEvent>,
    private readonly dataSource: DataSource,
    private readonly bomService: BomService,
  ) {}

  private clampNonNegativeFloat(value: any): number {
    const n = parseFloat((value ?? 0).toString());
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  private computeLineStatus(orderItem: OrderItems): string {
    const orderedQty = this.clampNonNegativeFloat(orderItem.quantity);
    const delivered = this.clampNonNegativeFloat((orderItem as any).quantityDelivered);
    const qc = this.clampNonNegativeFloat((orderItem as any).quantityQualityControlled);
    const printed = this.clampNonNegativeFloat((orderItem as any).quantityPrinted);
    const produced = this.clampNonNegativeFloat(orderItem.quantityProduced);

    if (orderedQty <= 0) return orderItem.status;

    if (delivered >= orderedQty - 1e-9) return 'Delivered';
    if (delivered > 0) return 'Until Delivery';

    if (qc >= orderedQty - 1e-9) return 'Completed';
    if (qc > 0) return 'Quality Control';

    if (printed >= orderedQty - 1e-9) return 'Printed';
    if (printed > 0) return 'Printing';

    if (produced > 0) return 'Production';
    return orderItem.status || 'Received';
  }

  private async appendEvent(
    queryRunner: any,
    orderItemId: string,
    type: OrderItemEventType,
    quantity: number,
    note?: string | null,
  ) {
    const event = this.orderItemEventRepository.create({
      orderItemId,
      type,
      quantity,
      note: note ?? null,
    });
    await queryRunner.manager.save(OrderItemEvent, event);
  }

  private resolveComponentLineTotal(component: {
    quantity?: number;
    unitCost?: number;
    totalCost?: number;
  }): number {
    const qty = parseFloat((component.quantity ?? 0).toString());
    const unitCost = parseFloat((component.unitCost ?? 0).toString());
    const computed = qty * unitCost;

    if (component.totalCost === undefined || component.totalCost === null) {
      return computed;
    }
    const explicit = parseFloat(component.totalCost.toString());
    if (Number.isNaN(explicit)) {
      return computed;
    }
    if (explicit === 0 && computed > 0) {
      return computed;
    }
    return explicit;
  }

  private calculateComponentsTotalCost(components?: Array<{ quantity?: number; unitCost?: number; totalCost?: number }>): number {
    if (!components || components.length === 0) {
      return 0;
    }

    return components.reduce((sum, component) => sum + this.resolveComponentLineTotal(component), 0);
  }

  private buildOrderItemComponents(orderItemId: string, components?: CreateOrderItemComponentDto[]) {
    if (!components || components.length === 0) {
      return [];
    }

    return components.map(component =>
      this.orderItemComponentRepository.create({
        orderItemId,
        itemId: component.itemId,
        uomId: component.uomId,
        quantity: parseFloat((component.quantity || 0).toString()),
        unitCost: parseFloat((component.unitCost || 0).toString()),
        unitSellingPrice: component.unitSellingPrice != null
          ? parseFloat(component.unitSellingPrice.toString())
          : null,
        totalCost: this.resolveComponentLineTotal(component),
        description: component.description || '',
        notes: component.notes || '',
      }),
    );
  }

  async create(createOrderItemDto: CreateOrderItemDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the order item
      const { orderItemNotes, components: explicitComponents, ...orderItemData } = createOrderItemDto;
      void orderItemNotes;
      const orderItemDataToSave: Partial<OrderItems> = orderItemData;

      const componentDtos =
        explicitComponents !== undefined
          ? explicitComponents
          : await this.bomService.toOrderItemComponents(
              createOrderItemDto.itemId,
              parseFloat((createOrderItemDto.quantity || 0).toString()),
            );

      const componentsTotalCost = this.calculateComponentsTotalCost(componentDtos);
      if (componentsTotalCost > 0) {
        orderItemDataToSave.totalCost = componentsTotalCost;
      }

      const orderItem = this.orderItemsRepository.create(orderItemDataToSave);
      const createdOrderItem = await queryRunner.manager.save(OrderItems, orderItem);
      const components = this.buildOrderItemComponents(createdOrderItem.id, componentDtos);

      if (components.length > 0) {
        await queryRunner.manager.save(OrderItemComponent, components);
      }

      // Update order status based on all order items
      await this.updateOrderStatus(createOrderItemDto.orderId, queryRunner);

      await queryRunner.commitTransaction();
      return createdOrderItem;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating order item:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }

      throw new Error(`An unexpected error occurred: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(orderId: string) {
    return await this.orderItemsRepository.find({
      where: { orderId },
      relations: [
        'order',
        'uom',
        'pricing',
        'item',
        'service',
        'components',
        'components.item',
        'components.uom',
        'orderItemNotes',
        'orderItemNotes.user',
        'events'
      ]
    });
  }

  async findAllOrderItems(skip: number, take: number, search?: string, startDate?: string, endDate?: string, item?: string, status?: string) {
    const queryBuilder = this.orderItemsRepository
      .createQueryBuilder('orderItems')
      .leftJoinAndSelect('orderItems.order', 'order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('orderItems.uom', 'uom')
      .leftJoinAndSelect('orderItems.pricing', 'pricing')
      .leftJoinAndSelect('orderItems.item', 'item')
      .leftJoinAndSelect('orderItems.service', 'service')
      .leftJoinAndSelect('orderItems.components', 'components')
      .leftJoinAndSelect('components.item', 'componentItem')
      .leftJoinAndSelect('components.uom', 'componentUom')
      .leftJoinAndSelect('orderItems.orderItemNotes', 'orderItemNotes')
      .leftJoinAndSelect('orderItemNotes.user', 'user')
      .orderBy('orderItems.createdAt', 'DESC')
      .skip(Number(skip))
      .take(Number(take));

    // Search filter
    if (search) {
      queryBuilder.where(
        '(order.series LIKE :search OR customer.fullName LIKE :search OR customer.phone LIKE :search OR customer.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Date range filter
    if (startDate && endDate) {
      queryBuilder.andWhere('order.orderDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    // Item filter
    if (item) {
      queryBuilder.andWhere('item.name LIKE :item', { item: `%${item}%` });
    }

    // Status filter
    if (status) {
      queryBuilder.andWhere('orderItems.status = :status', { status });
    }

    const [orderItems, total] = await queryBuilder.getManyAndCount();

    // Calculate total amount sum
    const totalAmountQuery = this.orderItemsRepository
      .createQueryBuilder('orderItems')
      .select('SUM(orderItems.totalAmount)', 'totalAmountSum');

    // Apply the same filters to the sum query
    if (search) {
      totalAmountQuery.leftJoin('orderItems.order', 'order')
        .leftJoin('order.customer', 'customer')
        .where('(order.series LIKE :search OR customer.fullName LIKE :search OR customer.phone LIKE :search OR customer.email LIKE :search)', 
          { search: `%${search}%` });
    }

    if (startDate && endDate) {
      totalAmountQuery.andWhere('order.orderDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    if (item) {
      totalAmountQuery.leftJoin('orderItems.item', 'item')
        .andWhere('item.name LIKE :item', { item: `%${item}%` });
    }

    if (status) {
      totalAmountQuery.andWhere('orderItems.status = :status', { status });
    }

    const totalAmountResult = await totalAmountQuery.getRawOne();
    const totalAmountSum = totalAmountResult?.totalAmountSum || 0;

    return {
      orderItems,
      total,
      totalAmountSum,
    };
  }

  async findOne(id: string) {
    return this.orderItemsRepository.findOne({
      where: { id },
      relations: ['order', 'uom', 'pricing', 'item', 'service', 'nonStockService', 'components', 'components.item', 'components.uom', 'orderItemNotes', 'orderItemNotes.user', 'events'],
    });
  }

  /**
   * Production records how many units were completed for this line (e.g. 5 of 50 banners).
   * Stock is reduced by (additionalQuantity / quantity) * unit for stock services.
   * When cumulative production reaches ordered quantity, status becomes Printed.
   */
  async recordProduction(orderItemId: string, dto: RecordProductionDto) {
    const additional = parseFloat(Number(dto.additionalQuantity).toString());
    if (!(additional > 0) || Number.isNaN(additional)) {
      throw new BadRequestException('additionalQuantity must be a positive number');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderItem = await queryRunner.manager.findOne(OrderItems, {
        where: { id: orderItemId },
        relations: ['item'],
      });

      if (!orderItem) {
        throw new NotFoundException('Order item not found');
      }

      const orderedQty = parseFloat((orderItem.quantity || 0).toString());
      if (orderedQty <= 0) {
        throw new BadRequestException('Order item has invalid quantity');
      }

      const producedSoFar = parseFloat((orderItem.quantityProduced ?? 0).toString());
      const remaining = orderedQty - producedSoFar;
      if (additional > remaining + 1e-9) {
        throw new BadRequestException(
          `Cannot record ${additional} more; only ${remaining} remaining of ${orderedQty} ordered`,
        );
      }

      const newProduced = producedSoFar + additional;
      const unitPortion = (orderItem.unit / orderedQty) * additional;

      if (!orderItem.isNonStockService && unitPortion > 0) {
        const operatorStock = await queryRunner.manager.findOne(OperatorStock, {
          where: { itemId: orderItem.itemId },
        });

        if (!operatorStock) {
          throw new ConflictException(
            `Please make a request for item ${orderItem.item?.name ?? orderItem.itemId} before recording production`,
          );
        }

        if (operatorStock.quantity < unitPortion) {
          throw new ConflictException(
            `Insufficient stock for item: ${orderItem.item?.name}. Available: ${operatorStock.quantity}, Required: ${unitPortion}`,
          );
        }

        await queryRunner.manager.update(OperatorStock, operatorStock.id, {
          quantity: operatorStock.quantity - unitPortion,
        });
      }

      await this.appendEvent(queryRunner, orderItemId, 'PRODUCTION', additional);

      const nextStatus = this.computeLineStatus({
        ...orderItem,
        quantityProduced: newProduced,
      } as OrderItems);

      await queryRunner.manager.update(OrderItems, orderItemId, {
        quantityProduced: newProduced,
        status: nextStatus,
      });

      await queryRunner.commitTransaction();

      await this.updateOrderStatus(orderItem.orderId);

      return this.orderItemsRepository.findOne({
        where: { id: orderItemId },
        relations: ['order', 'item', 'service', 'nonStockService', 'pricing', 'uom', 'components', 'components.item', 'components.uom', 'events'],
      });
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Printing step:
   * - ALL: print everything remaining (quantity - quantityPrinted)
   * - COMPLETED: print only produced-but-unprinted (quantityProduced - quantityPrinted)
   * - CUSTOM: print an explicit quantity (bounded by remaining to print)
   */
  async recordPrint(orderItemId: string, dto: RecordPrintDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderItem = await queryRunner.manager.findOne(OrderItems, {
        where: { id: orderItemId },
        relations: ['item'],
      });

      if (!orderItem) {
        throw new NotFoundException('Order item not found');
      }

      const orderedQty = this.clampNonNegativeFloat(orderItem.quantity);
      if (orderedQty <= 0) {
        throw new BadRequestException('Order item has invalid quantity');
      }

      const produced = this.clampNonNegativeFloat(orderItem.quantityProduced);
      const printed = this.clampNonNegativeFloat((orderItem as any).quantityPrinted);
      const remainingToPrint = Math.max(0, orderedQty - printed);
      const producedUnprinted = Math.max(0, Math.min(orderedQty, produced) - printed);

      let additionalToPrint = 0;
      if (dto.mode === 'ALL') {
        additionalToPrint = remainingToPrint;
      } else if (dto.mode === 'COMPLETED') {
        additionalToPrint = producedUnprinted;
      } else {
        const requested = this.clampNonNegativeFloat(dto.quantity);
        if (!(requested > 0)) {
          throw new BadRequestException('quantity must be a positive number when mode is CUSTOM');
        }
        additionalToPrint = Math.min(requested, remainingToPrint);
      }

      if (!(additionalToPrint > 0)) {
        throw new BadRequestException('Nothing to print (already fully printed or no completed quantity)');
      }

      const newPrinted = printed + additionalToPrint;

      // If printing happens without prior production records (print-all flow),
      // advance quantityProduced to match printed quantity and deduct stock proportionally.
      const impliedProducedTarget = Math.max(produced, newPrinted);
      const impliedProducedDelta = Math.max(0, impliedProducedTarget - produced);
      if (impliedProducedDelta > 0 && !orderItem.isNonStockService) {
        const unitPortion = (orderItem.unit / orderedQty) * impliedProducedDelta;
        if (unitPortion > 0) {
          const operatorStock = await queryRunner.manager.findOne(OperatorStock, {
            where: { itemId: orderItem.itemId },
          });

          if (!operatorStock) {
            throw new ConflictException(
              `Please make a request for item ${orderItem.item?.name ?? orderItem.itemId} before trying to print`,
            );
          }

          if (operatorStock.quantity < unitPortion) {
            throw new ConflictException(
              `Insufficient stock for item: ${orderItem.item?.name}. Available: ${operatorStock.quantity}, Required: ${unitPortion}`,
            );
          }

          await queryRunner.manager.update(OperatorStock, operatorStock.id, {
            quantity: operatorStock.quantity - unitPortion,
          });
        }
      }

      await this.appendEvent(queryRunner, orderItemId, 'PRINT', additionalToPrint, dto.mode);

      const nextStatus = this.computeLineStatus({
        ...orderItem,
        quantityProduced: impliedProducedTarget,
        quantityPrinted: newPrinted,
      } as any);

      await queryRunner.manager.update(OrderItems, orderItemId, {
        ...(impliedProducedDelta > 0 ? { quantityProduced: impliedProducedTarget } : {}),
        quantityPrinted: newPrinted,
        status: nextStatus,
      });

      await queryRunner.commitTransaction();
      await this.updateOrderStatus(orderItem.orderId);

      return this.orderItemsRepository.findOne({
        where: { id: orderItemId },
        relations: ['order', 'item', 'service', 'nonStockService', 'pricing', 'uom', 'components', 'components.item', 'components.uom', 'events'],
      });
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async recordQualityControl(orderItemId: string, dto: RecordStepQuantityDto) {
    const additional = this.clampNonNegativeFloat(dto.additionalQuantity);
    if (!(additional > 0)) {
      throw new BadRequestException('additionalQuantity must be a positive number');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderItem = await queryRunner.manager.findOne(OrderItems, { where: { id: orderItemId } });
      if (!orderItem) {
        throw new NotFoundException('Order item not found');
      }

      const orderedQty = this.clampNonNegativeFloat(orderItem.quantity);
      const printed = this.clampNonNegativeFloat((orderItem as any).quantityPrinted);
      const qc = this.clampNonNegativeFloat((orderItem as any).quantityQualityControlled);

      const remainingPrintedToQc = Math.max(0, Math.min(orderedQty, printed) - qc);
      if (additional > remainingPrintedToQc + 1e-9) {
        throw new BadRequestException(`Cannot QC ${additional}; only ${remainingPrintedToQc} printed units remain for QC`);
      }

      const newQc = qc + additional;

      await this.appendEvent(queryRunner, orderItemId, 'QUALITY_CONTROL', additional);

      const nextStatus = this.computeLineStatus({
        ...orderItem,
        quantityQualityControlled: newQc,
      } as any);

      await queryRunner.manager.update(OrderItems, orderItemId, {
        quantityQualityControlled: newQc,
        status: nextStatus,
      });

      await queryRunner.commitTransaction();
      await this.updateOrderStatus(orderItem.orderId);

      return this.orderItemsRepository.findOne({
        where: { id: orderItemId },
        relations: ['order', 'item', 'service', 'nonStockService', 'pricing', 'uom', 'components', 'components.item', 'components.uom', 'events'],
      });
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async recordDelivery(orderItemId: string, dto: RecordStepQuantityDto) {
    const additional = this.clampNonNegativeFloat(dto.additionalQuantity);
    if (!(additional > 0)) {
      throw new BadRequestException('additionalQuantity must be a positive number');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderItem = await queryRunner.manager.findOne(OrderItems, { where: { id: orderItemId } });
      if (!orderItem) {
        throw new NotFoundException('Order item not found');
      }

      const orderPayment = await queryRunner.manager.findOne(PaymentTerm, {
        where: { orderId: orderItem.orderId },
      });
      if (orderPayment && orderPayment.forcePayment && orderPayment.remainingAmount > 0) {
        throw new ConflictException(
          `Payment is not completed. Cannot deliver order with outstanding payment of ${orderPayment.remainingAmount}.`,
        );
      }

      const orderedQty = this.clampNonNegativeFloat(orderItem.quantity);
      const qc = this.clampNonNegativeFloat((orderItem as any).quantityQualityControlled);
      const delivered = this.clampNonNegativeFloat((orderItem as any).quantityDelivered);

      const remainingQcToDeliver = Math.max(0, Math.min(orderedQty, qc) - delivered);
      if (additional > remainingQcToDeliver + 1e-9) {
        throw new BadRequestException(`Cannot deliver ${additional}; only ${remainingQcToDeliver} QC units remain to deliver`);
      }

      const newDelivered = delivered + additional;

      await this.appendEvent(queryRunner, orderItemId, 'DELIVERY', additional);

      const nextStatus = this.computeLineStatus({
        ...orderItem,
        quantityDelivered: newDelivered,
      } as any);

      await queryRunner.manager.update(OrderItems, orderItemId, {
        quantityDelivered: newDelivered,
        status: nextStatus,
      });

      await queryRunner.commitTransaction();
      await this.updateOrderStatus(orderItem.orderId);

      return this.orderItemsRepository.findOne({
        where: { id: orderItemId },
        relations: ['order', 'item', 'service', 'nonStockService', 'pricing', 'uom', 'components', 'components.item', 'components.uom', 'events'],
      });
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get the current order item to check status changes
      const currentOrderItem = await this.orderItemsRepository.findOne({
        where: { id },
        relations: ['item', 'components'],
      });

      if (!currentOrderItem) {
        throw new NotFoundException('Order item not found');
      }

      let quantityProducedToSet: number | undefined;

      // Handle stock reduction for Printed or Void status (only when status changes to these states)
      // Only reduce stock for stock services (not non-stock services like PRINT-ONLY, CUT-ONLY)
      if ((updateOrderItemDto.status === 'Printed' || updateOrderItemDto.status === 'Void') && 
          currentOrderItem.status !== 'Printed' && currentOrderItem.status !== 'Void' &&
          !currentOrderItem.isNonStockService) {
        
        const operatorStock = await this.operatorStockRepository.findOne({
          where: { itemId: currentOrderItem.itemId },
        });

        if (!operatorStock) {
          throw new ConflictException(`Please make a request for item ${currentOrderItem.item.name} before trying to print`);
        }

        const orderedQty = parseFloat((currentOrderItem.quantity || 0).toString());
        if (orderedQty <= 0) {
          throw new ConflictException('Invalid order item quantity for stock deduction');
        }

        const produced = parseFloat((currentOrderItem.quantityProduced ?? 0).toString());
        let quantityToReduce = 0;
        if (produced === 0) {
          quantityToReduce = currentOrderItem.unit;
          quantityProducedToSet = orderedQty;
        } else if (produced < orderedQty) {
          quantityToReduce = currentOrderItem.unit * (orderedQty - produced) / orderedQty;
          quantityProducedToSet = orderedQty;
        }

        if (quantityToReduce > 0) {
          if (operatorStock.quantity < quantityToReduce) {
            throw new ConflictException(`Insufficient stock for item: ${currentOrderItem.item.name}. Available: ${operatorStock.quantity}, Required: ${quantityToReduce}`);
          }

          await queryRunner.manager.update(OperatorStock, operatorStock.id, {
            quantity: operatorStock.quantity - quantityToReduce,
          });
        }
      }

      // Handle stock restoration when status changes from Printed/Void to other states
      // Only restore stock for stock services (not non-stock services like PRINT-ONLY, CUT-ONLY)
      if ((currentOrderItem.status === 'Printed' || currentOrderItem.status === 'Void') && 
          updateOrderItemDto.status !== 'Printed' && updateOrderItemDto.status !== 'Void' &&
          !currentOrderItem.isNonStockService) {
        
        const operatorStock = await this.operatorStockRepository.findOne({
          where: { itemId: currentOrderItem.itemId },
        });

        if (operatorStock) {
          const orderedQty = parseFloat((currentOrderItem.quantity || 0).toString()) || 1;
          const produced = parseFloat((currentOrderItem.quantityProduced ?? 0).toString());
          const quantityToRestore =
            produced === 0 ? currentOrderItem.unit : currentOrderItem.unit * (produced / orderedQty);

          await queryRunner.manager.update(OperatorStock, operatorStock.id, {
            quantity: operatorStock.quantity + quantityToRestore,
          });
        }
      }

      // Check payment verification based on forcePayment setting and status
      const orderPayment = await this.paymentTermRepository.findOne({
        where: { orderId: updateOrderItemDto.orderId },
        relations: ['order'],
      });

      if (orderPayment) {
        console.log('Payment verification:', {
          orderId: updateOrderItemDto.orderId,
          newStatus: updateOrderItemDto.status,
          forcePayment: orderPayment.forcePayment,
          remainingAmount: orderPayment.remainingAmount,
          totalAmount: orderPayment.totalAmount
        });

        // Check payment when status changes to "Delivered" - only if forcePayment is true
        if (updateOrderItemDto.status === 'Delivered' && orderPayment.forcePayment && orderPayment.remainingAmount > 0) {
          throw new ConflictException(
            `Payment is not completed. Cannot deliver order with outstanding payment of ${orderPayment.remainingAmount}.`
          );
        }
        
        // For other status changes, only block if forcePayment is true and payment is not paid at all
        if (
          orderPayment.forcePayment &&
          orderPayment.remainingAmount === orderPayment.totalAmount && // Not paid at all
          updateOrderItemDto.status !== 'Delivered'
        ) {
          throw new ConflictException(
            `Payment is not completed. Cannot change status to "${updateOrderItemDto.status}" because force payment is enabled and no payment has been made.`
          );
        }
      }

      const componentsTotalCost = this.calculateComponentsTotalCost(updateOrderItemDto.components);

      // Update the order item
      await queryRunner.manager.update(OrderItems, id, {
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
        discount: parseFloat((updateOrderItemDto.discount || 0).toString()),
        level: updateOrderItemDto.level,
        totalAmount: parseFloat((updateOrderItemDto.totalAmount || 0).toString()),
        adminApproval: updateOrderItemDto.adminApproval,
        uomId: updateOrderItemDto.uomId,
        unitPrice: parseFloat((updateOrderItemDto.unitPrice || 0).toString()),
        description: updateOrderItemDto.description,
        isDiscounted: updateOrderItemDto.isDiscounted,
        status: updateOrderItemDto.status,
        pricingId: updateOrderItemDto.pricingId,
        unit: parseFloat((updateOrderItemDto.unit || 0).toString()),
        baseUomId: updateOrderItemDto.baseUomId,
        ...(quantityProducedToSet !== undefined ? { quantityProduced: quantityProducedToSet } : {}),
        ...(updateOrderItemDto.components !== undefined ? { totalCost: componentsTotalCost } : {}),
      });

      if (updateOrderItemDto.components !== undefined) {
        await queryRunner.manager.delete(OrderItemComponent, { orderItemId: id });
        const components = this.buildOrderItemComponents(id, updateOrderItemDto.components);

        if (components.length > 0) {
          await queryRunner.manager.save(OrderItemComponent, components);
        }
      }

      // Update order status based on all order items
      await this.updateOrderStatus(updateOrderItemDto.orderId, queryRunner);

      await queryRunner.commitTransaction();

      return await this.orderItemsRepository.findOne({
        where: { id },
        relations: ['order', 'item', 'service', 'pricing', 'uom', 'components', 'components.item', 'components.uom'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error updating order item:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const orderItem = await this.orderItemsRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    const orderId = orderItem.orderId;
    await this.orderItemsRepository.remove(orderItem);

    // Update order status after removal
    await this.updateOrderStatus(orderId);

    return { message: `Order item with ID ${id} removed successfully` };
  }

  private async updateOrderStatus(orderId: string, queryRunner?: any) {
    const orderItems = await (queryRunner ? queryRunner.manager.find(OrderItems, {
      where: { orderId },
    }) : this.orderItemsRepository.find({
      where: { orderId },
    }));

    // Check if all statuses are the same
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

    // Update the order status
    await (queryRunner ? queryRunner.manager.update(Order, orderId, {
      status: newOrderStatus,
    }) : this.orderRepository.update(orderId, {
      status: newOrderStatus,
    }));
  }
}
