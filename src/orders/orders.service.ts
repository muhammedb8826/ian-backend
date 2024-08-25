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
      return await this.prisma.orders.create({
        data: {
          series: createOrderDto.series,
          customerId: createOrderDto.customerId,
          status: createOrderDto.status,
          orderDate: new Date(createOrderDto.orderDate),
          deliveryDate: new Date(createOrderDto.deliveryDate),
          orderSource: createOrderDto.orderSource,
          totalAmount: createOrderDto.totalAmount,
          tax: createOrderDto.tax,
          grandTotal: createOrderDto.grandTotal,
          totalQuantity: createOrderDto.totalQuantity,
          internalNote: createOrderDto.internalNote,
          paymentTermId: createOrderDto.paymentTermId,
          commissionId: createOrderDto.commissionId,
          fileNames: createOrderDto.fileNames,
          adminApproval: createOrderDto.adminApproval,
          salesPartnersId: createOrderDto.salesPartnersId || null,

          // Order Items

          orderItems: {
            create: createOrderDto.orderItems?.map((item) => ({
              itemId: item.itemId,
              serviceId: item.serviceId,
              width: parseFloat(item.width.toString()),
              height: parseFloat(item.height.toString()),
              discount: item.discount,
              level: item.level,
              totalAmount: item.totalAmount,
              adminApproval: item.adminApproval,
              uomId: item.uomId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              description: item.description,
              status: item.status,
              isDiscounted: item.isDiscounted,
            })) || [],
          },


           // Payment Term and Transactions

          paymentTerm: createOrderDto.paymentTerm ? {
            create: {
              totalAmount: createOrderDto.paymentTerm.totalAmount,
              remainingAmount: createOrderDto.paymentTerm.remainingAmount,
              status: createOrderDto.paymentTerm.status,
              forcePayment: createOrderDto.paymentTerm.forcePayment,
              transactions: {
                create: createOrderDto.paymentTerm.transactions?.map((transaction) => ({
                  date: transaction.date,
                  paymentMethod: transaction.paymentMethod,
                  reference: transaction.reference,
                  amount: parseFloat(transaction.amount.toString()),
                  status: transaction.status,
                  description: transaction.description,
                  orderId: createOrderDto.id,
                })) || [],
              }
            },
          } : undefined,


          // Commission and Transactions


          commission: createOrderDto.commission ? {
            create: {
              salesPartnerId: createOrderDto.commission.salesPartnerId,
              totalAmount: createOrderDto.commission.totalAmount,
              transactions: {
                create: createOrderDto.commission.transactions?.map((transaction) => ({
                  date: transaction.date,
                  amount: transaction.amount,
                  percentage: transaction.percentage,
                  paymentMethod: transaction.paymentMethod,
                  reference: transaction.reference,
                  status: transaction.status,
                  description: transaction.description,
                  orderId: createOrderDto.id,
                })) || [],
              }
            },
          } : undefined,
        },
      })
    } catch (error) {
      console.error("Error creating order:", error);

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
        paymentTerm: true,
        commission: true,
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
        paymentTerm: true,
        commission: true,
        salesPartner: true,
      },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.prisma.orders.update({
      where: { id },
      data: {
        series: updateOrderDto.series,
        customerId: updateOrderDto.customerId,
        status: updateOrderDto.status,
        orderDate: updateOrderDto.orderDate,
        deliveryDate: updateOrderDto.deliveryDate,
        totalAmount: updateOrderDto.totalAmount,
        tax: updateOrderDto.tax,
        grandTotal: updateOrderDto.grandTotal,
        totalQuantity: updateOrderDto.totalQuantity,
        internalNote: updateOrderDto.internalNote,
        paymentTermId: updateOrderDto.paymentTermId,
        commissionId: updateOrderDto.commissionId,
        fileNames: updateOrderDto.fileNames,
        adminApproval: updateOrderDto.adminApproval,
        salesPartnersId: updateOrderDto.salesPartnersId,
        orderItems: {
          update: updateOrderDto.orderItems?.map((item) => ({
            where: { id: item.id },
            data: {
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
              status: item.status,
              isDiscounted: item.isDiscounted,
            },
          })) || [],
        },
        paymentTerm: updateOrderDto.paymentTerm ? {
          update: {
            where: { id: updateOrderDto.paymentTerm.id },
            data: {
              totalAmount: updateOrderDto.paymentTerm.totalAmount,
              remainingAmount: updateOrderDto.paymentTerm.remainingAmount,
              status: updateOrderDto.paymentTerm.status,
              forcePayment: updateOrderDto.paymentTerm.forcePayment,
              transactions: {
                update: updateOrderDto.paymentTerm.transactions?.map((transaction) => ({
                  where: { id: transaction.id },
                  data: {
                    date: transaction.date,
                    paymentMethod: transaction.paymentMethod,
                    reference: transaction.reference,
                    amount: transaction.amount,
                    status: transaction.status,
                    description: transaction.description,
                    orderId: id,
                  },
                })) || [],
              },
            },
          },
        } : undefined,
        commission: updateOrderDto.commission ? {
          update: {
            where: { id: updateOrderDto.commission.id },
            data: {
              salesPartnerId: updateOrderDto.commission.salesPartnerId,
              totalAmount: updateOrderDto.commission.totalAmount,
              transactions: {
                update: updateOrderDto.commission.transactions?.map((transaction) => ({
                  where: { id: transaction.id },
                  data: {
                    date: transaction.date,
                    amount: transaction.amount,
                    percentage: transaction.percentage,
                    commissionId: updateOrderDto.commission.id,
                    paymentMethod: transaction.paymentMethod,
                    reference: transaction.reference,
                    status: transaction.status,
                    description: transaction.description,
                    orderId: id,
                  },
                })) || [],
              },
            },
          },
        } : undefined,
      },
    });
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
