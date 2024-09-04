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
              totalAmount: createOrderDto.commission.totalAmount,
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
              width: parseFloat(item.width.toString()),
              height: parseFloat(item.height.toString()),
              discount: parseFloat(item.discount.toString()),
              level: item.level,
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

  async findAll(skip: number, take: number, search?: string) {
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
            }
          },
          paymentTerm: true,
          commission: true,
          salesPartner: true,
        },
        where: search ? {
          OR: [
            { id: { contains: search } },
            { series: { contains: search } },
          ],
        } : {},
      }),
      this.prisma.orders.count(),
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
        commission: { include: { transactions: true, salesPartner:true } },
        salesPartner: true,
      },
    });

    if (!existingOrder) {
      throw new Error('Order not found');
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
                width: parseFloat(item.width.toString()),
                height: parseFloat(item.height.toString()),
                discount: parseFloat(item.discount.toString()),
                level: item.level,
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
                width: parseFloat(item.width.toString()),
                height: parseFloat(item.height.toString()),
                discount: parseFloat(item.discount.toString()),
                level: item.level,
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
