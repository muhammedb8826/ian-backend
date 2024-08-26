import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

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
          orderItems: true,
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
        orderItems: true,
        paymentTerm: {
          include: {
            transactions: true,
          },
        },
        commission: {
          include: {
            transactions: true,
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
        orderItems: true,
        paymentTerm: {
          include: {
            transactions: true,
          },
        },
        commission: {
          include: {
            transactions: true,
          },
        },
        salesPartner: true,
      },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      const updatedOrder = await this.prisma.orders.update({
        where: { id },
        data: {
          series: updateOrderDto.series,
          status: updateOrderDto.status,
          orderDate: updateOrderDto.orderDate,
          deliveryDate: updateOrderDto.deliveryDate,
          totalAmount: updateOrderDto.totalAmount,
          orderSource: updateOrderDto.orderSource,
          tax: updateOrderDto.tax,
          grandTotal: updateOrderDto.grandTotal,
          totalQuantity: updateOrderDto.totalQuantity,
          internalNote: updateOrderDto.internalNote,
          fileNames: updateOrderDto.fileNames,
          adminApproval: updateOrderDto.adminApproval,
          orderItems: {
            upsert: updateOrderDto.orderItems.map(item => ({
              where: { id: item.id }, // Assumes each item has an `id`
              update: {
                itemId: item.itemId,
                serviceId: item.serviceId,
                width: item.width,
                height: item.height,
                discount: item.discount,
                level: item.level,
                totalAmount: item.totalAmount,
                adminApproval: item.adminApproval,
                uomId: item.uomId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                description: item.description,
                isDiscounted: item.isDiscounted,
                status: item.status,
              },
              create: {
                itemId: item.itemId,
                serviceId: item.serviceId,
                width: item.width,
                height: item.height,
                discount: item.discount,
                level: item.level,
                totalAmount: item.totalAmount,
                adminApproval: item.adminApproval,
                uomId: item.uomId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                description: item.description,
                isDiscounted: item.isDiscounted,
                status: item.status,
              },
            })),
          },
          paymentTerm: updateOrderDto.paymentTerm ? {
            upsert: {
              where: { id: updateOrderDto.paymentTerm.id }, // Assumes paymentTerm has an `id`
              update: {
                totalAmount: updateOrderDto.paymentTerm.totalAmount,
                remainingAmount: updateOrderDto.paymentTerm.remainingAmount,
                status: updateOrderDto.paymentTerm.status,
                forcePayment: updateOrderDto.paymentTerm.forcePayment,
                transactions: {
                  upsert: updateOrderDto.paymentTerm.transactions.map(transaction => ({
                    where: { id: transaction.id }, // Assumes each transaction has an `id`
                    update: {
                      date: transaction.date,
                      paymentMethod: transaction.paymentMethod,
                      reference: transaction.reference,
                      amount: transaction.amount,
                      status: transaction.status,
                      description: transaction.description,
                    },
                    create: {
                      date: transaction.date,
                      paymentMethod: transaction.paymentMethod,
                      reference: transaction.reference,
                      amount: transaction.amount,
                      status: transaction.status,
                      description: transaction.description,
                    },
                  })),
                },
              },
              create: {
                totalAmount: updateOrderDto.paymentTerm.totalAmount,
                remainingAmount: updateOrderDto.paymentTerm.remainingAmount,
                status: updateOrderDto.paymentTerm.status,
                forcePayment: updateOrderDto.paymentTerm.forcePayment,
                transactions: {
                  create: updateOrderDto.paymentTerm.transactions, // Assumes data.paymentTerm.transactions is an array
                },
              },
            },
          } : undefined,
          commission: updateOrderDto.commission ? {
            upsert: {
              where: { id: updateOrderDto.commission.id }, // Assumes commission has an `id`
              update: {
                salesPartnerId: updateOrderDto.commission.salesPartnerId,
                totalAmount: updateOrderDto.commission.totalAmount,
                transactions: {
                  upsert: updateOrderDto.commission.transactions.map(transaction => ({
                    where: { id: transaction.id }, // Assumes each transaction has an `id`
                    update: {
                      date: transaction.date,
                      amount: transaction.amount,
                      percentage: transaction.percentage,
                      paymentMethod: transaction.paymentMethod,
                      reference: transaction.reference,
                      status: transaction.status,
                      description: transaction.description,
                    },
                    create: {
                      date: transaction.date,
                      amount: transaction.amount,
                      percentage: transaction.percentage,
                      paymentMethod: transaction.paymentMethod,
                      reference: transaction.reference,
                      status: transaction.status,
                      description: transaction.description,
                    },
                  })),
                },
              },
              create: {
                salesPartnerId: updateOrderDto.commission.salesPartnerId,
                totalAmount: updateOrderDto.commission.totalAmount,
                transactions: {
                  create: updateOrderDto.commission.transactions, // Assumes data.commission.transactions is an array
                },
              },
            },
          } : undefined,
          salesPartner: updateOrderDto.salesPartner ? {
            connect: { id: updateOrderDto.salesPartner.id },
          } : undefined,
        },
      });
  
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
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
