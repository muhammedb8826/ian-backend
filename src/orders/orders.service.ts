import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }
  async create(createOrderDto: CreateOrderDto) {
    try {
      const order = await this.prisma.orders.create({
        data: {
          series: createOrderDto.series,
          customer: {
            connect: { id: createOrderDto.customerId }, // Ensure `customerId` is correctly referenced
          },
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
          paymentTerm: createOrderDto.paymentTerm ? {
            create: {
              totalAmount: parseFloat(createOrderDto.paymentTerm.totalAmount.toString()),
              remainingAmount: parseFloat(createOrderDto.paymentTerm.remainingAmount.toString()),
              status: createOrderDto.paymentTerm.status,
              forcePayment: createOrderDto.paymentTerm.forcePayment,
              transactions: {
                create: createOrderDto.paymentTerm.transactions?.map(transaction => ({
                  date: new Date(transaction.date),
                  paymentMethod: transaction.paymentMethod,
                  reference: transaction.reference,
                  amount: parseFloat(transaction.amount.toString()),
                  status: transaction.status,
                  description: transaction.description,
                })) || [],
              },
            },
          } : undefined,
          commission: createOrderDto.commission ? {
            create: {
              salesPartner: { connect: { id: createOrderDto.commission.salesPartnerId } },
              totalAmount: parseFloat(createOrderDto.commission.totalAmount.toString()),
              paidAmount: parseFloat(createOrderDto.commission.paidAmount.toString()),
              transactions: {
                create: createOrderDto.commission.transactions?.map(transaction => ({
                  date: new Date(transaction.date),
                  amount: parseFloat(transaction.amount.toString()),
                  percentage: parseFloat(transaction.percentage.toString()),
                  paymentMethod: transaction.paymentMethod,
                  reference: transaction.reference,
                  status: transaction.status,
                  description: transaction.description,
                })) || [],
              },
            },
          } : undefined,
          salesPartner: createOrderDto.salesPartner ? {
            connect: { id: createOrderDto.salesPartner.id },
          } : undefined,

          orderItems: {
            create: createOrderDto.orderItems.map(item => ({
              itemId: item.itemId,
              serviceId: item.serviceId,
              width: parseFloat(item.width.toString()) || null,
              height: parseFloat(item.height.toString()) || null,
              discount: parseFloat(item.discount.toString()),
              level: parseFloat(item.level.toString()),
              totalAmount: parseFloat(item.totalAmount.toString()),
              adminApproval: item.adminApproval,
              uomId: item.uomId,
              quantity: parseFloat(item.quantity.toString()),
              unitPrice: parseFloat(item.unitPrice.toString()),
              description: item.description,
              isDiscounted: item.isDiscounted,
              status: item.status,
              pricingId: item.pricingId,
              unit: parseFloat(item.unit.toString()),
              baseUomId: item.baseUomId,
            })),
          },
        },
      });

      return order;
    } catch (error) {
      console.error('Error creating order:', error);

      // Check if it's a Prisma error
      if (error.code === 'P2002') {
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }

      // Log the error details for better debugging
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error details:', error.meta);
      }

      // Throw a more informative error for better feedback
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }

  async findAll(skip: number, take: number, search?: string, startDate?: string, endDate?: string, orderItemNames?: string[]) {
    const whereClause: any = {};

    // Handle the search filter
    if (search) {
        whereClause.OR = [
            { id: { contains: search, mode: 'insensitive' } },
            { series: { contains: search, mode: 'insensitive' } },
            { customer: { fullName: { contains: search, mode: 'insensitive' } } },
            { customer: { phone: { contains: search, mode: 'insensitive' } } },
            { orderItems: { some: { description: { contains: search, mode: 'insensitive' } } } },
            { paymentTerm: { transactions: { some: { reference: { contains: search, mode: 'insensitive' } } } } },
            { commission: { transactions: { some: { reference: { contains: search, mode: 'insensitive' } } } } },
            { salesPartner: { fullName: { contains: search, mode: 'insensitive' } } }
        ];
    }

    // Handle the date range filter
    if (startDate && endDate) {
        whereClause.orderDate = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }

    // Handle order item names filter
    if (orderItemNames && orderItemNames.length > 0) {
      whereClause.orderItems = {
          some: {
              name: {
                  in: orderItemNames, // Filtering order items that match the given names
              }
          }
      };
  }

    // Fetch the orders and total count using the unified whereClause
    const [orders, total] = await this.prisma.$transaction([
        this.prisma.orders.findMany({
            skip: Number(skip),
            take: Number(take),
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                customer: true,
                orderItems: {
                    include: {
                        pricing: true,
                    },
                },
                paymentTerm: true,
                commission: true,
                salesPartner: true,
            },
            where: whereClause, // Use the unified whereClause for filtering
        }),
        this.prisma.orders.count({
            where: whereClause, // Apply the same whereClause for the count
        }),
    ]);

    return {
        orders,
        total,
    };
}


  async findAllOrders() {
    return this.prisma.orders.findMany({
      include: {
        customer: true,
        orderItems: {
          include: {
            pricing: true,
          }
        },
        paymentTerm: {
          include: {
            transactions: true,
          },
        },
        commission: {
          include: {
            transactions: true,
            salesPartner: true,
          },
        },
        salesPartner: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.orders.findUnique({
      where: { id },
      include: {
        customer: true,
        orderItems: {
          include: {
            pricing: true
          }
        },
        paymentTerm: {
          include: {
            transactions: true,
          },
        },
        commission: {
          include: {
            transactions: true,
            salesPartner: true,
          },
        },
        salesPartner: true,
      },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const { orderItems, paymentTerm, commission, salesPartner, ...orderData } = updateOrderDto;

    // Fetch the existing order and related data
    const existingOrder = await this.prisma.orders.findUnique({
      where: { id },
      include: {
        orderItems: true,
        paymentTerm: { include: { transactions: true } },
        commission: { include: { transactions: true, salesPartner: true } },
        salesPartner: true,
      },
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
      if(transaction.amount === null || transaction.amount === 0) {
        throw new ConflictException(`Amount for commission transaction #${index + 1} is missing.`);
      }

      if(transaction.percentage === null || transaction.percentage === 0) {
        throw new ConflictException(`Percentage for commission transaction #${index + 1} is missing.`);
      }

      if(transaction.date === null) {
        throw new ConflictException(`Date for commission transaction #${index + 1} is missing.`);
      }

      if(transaction.reference === null) {
        throw new ConflictException(`Reference for commission transaction #${index + 1} is missing.`);
      }

      if(transaction.status === null) {
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


    try {
      // Perform the update operation
      const updatedOrder = await this.prisma.orders.update({
        where: { id },
        data: {
          series: orderData.series,
          customer: {
            connect: { id: orderData.customerId },
          },
          status: orderData.status,
          orderDate: new Date(orderData.orderDate),
          deliveryDate: new Date(orderData.deliveryDate),
          orderSource: orderData.orderSource,
          totalAmount: parseFloat(orderData.totalAmount.toString()),
          tax: parseFloat(orderData.tax.toString()),
          grandTotal: parseFloat(orderData.grandTotal.toString()),
          totalQuantity: parseFloat(orderData.totalQuantity.toString()),
          internalNote: orderData.internalNote,
          fileNames: orderData.fileNames,
          adminApproval: orderData.adminApproval,



          // Update Order Items
          orderItems: {
            deleteMany: { id: { in: orderItemsToDelete } },
            upsert: orderItems.map(item => ({
              where: { id: item.id || '' },
              update: {
                itemId: item.itemId,
                serviceId: item.serviceId,
                width: item.width !== null ? parseFloat(item.width.toString()) : null,
                height: item.height !== null ? parseFloat(item.height.toString()) : null,
                discount: item.discount !== null ? parseFloat(item.discount.toString()) : 0,
                level: parseFloat(item.level.toString()),
                totalAmount: parseFloat(item.totalAmount.toString()),
                adminApproval: item.adminApproval,
                uomId: item.uomId,
                quantity: parseFloat(item.quantity.toString()),
                unitPrice: parseFloat(item.unitPrice.toString()),
                description: item.description,
                isDiscounted: item.isDiscounted,
                status: item.status,
                pricingId: item.pricingId,
                unit: parseFloat(item.unit.toString()),
                baseUomId: item.baseUomId,
              },
              create: {
                itemId: item.itemId,
                serviceId: item.serviceId,
                width: item.width !== null ? parseFloat(item.width.toString()) : 0,
                height: item.height !== null ? parseFloat(item.height.toString()) : 0,
                discount: item.discount !== null ? parseFloat(item.discount.toString()) : 0,
                level: parseFloat(item.level.toString()),
                totalAmount: parseFloat(item.totalAmount.toString()),
                adminApproval: item.adminApproval,
                uomId: item.uomId,
                quantity: parseFloat(item.quantity.toString()),
                unitPrice: parseFloat(item.unitPrice.toString()),
                description: item.description,
                isDiscounted: item.isDiscounted,
                status: item.status,
                pricingId: item.pricingId,
                unit: parseFloat(item.unit.toString()),
                baseUomId: item.baseUomId,
              },
            })),
          },


          // Update Payment Term
          paymentTerm: paymentTerm ? {
            delete: existingOrder.paymentTerm ? { id: existingOrder.paymentTerm.id } : undefined,
            upsert: {
              where: { id: paymentTerm.id || '' },
              update: {
                totalAmount: parseFloat(paymentTerm.totalAmount.toString()),
                remainingAmount: parseFloat(paymentTerm.remainingAmount.toString()),
                status: paymentTerm.status,
                forcePayment: paymentTerm.forcePayment,
                transactions: {
                  upsert: paymentTerm.transactions.map(transaction => ({
                    where: { id: transaction.id || '' },
                    update: {
                      date: new Date(transaction.date),
                      paymentMethod: transaction.paymentMethod,
                      reference: transaction.reference,
                      amount: parseFloat(transaction.amount.toString()),
                      status: transaction.status,
                      description: transaction.description,
                    },
                    create: {
                      date: new Date(transaction.date),
                      paymentMethod: transaction.paymentMethod,
                      reference: transaction.reference,
                      amount: parseFloat(transaction.amount.toString()),
                      status: transaction.status,
                      description: transaction.description,
                    },
                  })),
                },
              },
              create: {
                totalAmount: parseFloat(paymentTerm.totalAmount.toString()),
                remainingAmount: parseFloat(paymentTerm.remainingAmount.toString()),
                status: paymentTerm.status,
                forcePayment: paymentTerm.forcePayment,
                transactions: {
                  create: paymentTerm.transactions.map(transaction => ({
                    date: new Date(transaction.date),
                    paymentMethod: transaction.paymentMethod,
                    reference: transaction.reference,
                    amount: parseFloat(transaction.amount.toString()),
                    status: transaction.status,
                    description: transaction.description,
                  })),
                },
              },
            },
          } : undefined,


          // Update Commission
          commission: commission ? {
            delete: existingOrder.commission ? { id: existingOrder.commission.id } : undefined,
            upsert: {
              where: { id: commission.id || '' },
              update: {
                salesPartnerId: commission.salesPartnerId,
                totalAmount: parseFloat(commission.totalAmount.toString()),
                paidAmount: parseFloat(commission.paidAmount.toString()),
                transactions: {
                  upsert: commission.transactions.map(transaction => ({
                    where: { id: transaction.id || '' },
                    update: {
                      date: new Date(transaction.date),
                      amount: parseFloat(transaction.amount.toString()),
                      percentage: parseFloat(transaction.percentage.toString()),
                      paymentMethod: transaction.paymentMethod,
                      reference: transaction.reference,
                      status: transaction.status,
                      description: transaction.description,
                    },
                    create: {
                      date: new Date(transaction.date),
                      amount: parseFloat(transaction.amount.toString()),
                      percentage: parseFloat(transaction.percentage.toString()),
                      paymentMethod: transaction.paymentMethod,
                      reference: transaction.reference,
                      status: transaction.status,
                      description: transaction.description,
                    },
                  })),
                },
              },
              create: {
                salesPartnerId: commission.salesPartnerId,
                totalAmount: parseFloat(commission.totalAmount.toString()),
                paidAmount: parseFloat(commission.paidAmount.toString()),
                transactions: {
                  create: commission.transactions.map(transaction => ({
                    date: new Date(transaction.date),
                    amount: parseFloat(transaction.amount.toString()),
                    percentage: parseFloat(transaction.percentage.toString()),
                    paymentMethod: transaction.paymentMethod,
                    reference: transaction.reference,
                    status: transaction.status,
                    description: transaction.description,
                  })),
                },
              },
            },
          } : undefined,

          // Connect Sales Partner if available
          salesPartner: salesPartner ? {
            connect: { id: salesPartner.id },
          } : undefined,
        },
        include: {
          customer: true,
          orderItems: true,
          paymentTerm: { include: { transactions: true } },
          commission: { include: { transactions: true, salesPartner: true } },
          salesPartner: true,
        },
      });

      return updatedOrder;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Unique constraint violation: An order with the same item and service already exists.');
        }
      }
      console.error('Error updating order:', error);
      throw new BadRequestException('Failed to update order');
    }
  }


  async remove(id: string) {
    try {
      return this.prisma.orders.delete({
        where: { id },
      });
    } catch (error) {
      console.log(error);

    }
  }
}
