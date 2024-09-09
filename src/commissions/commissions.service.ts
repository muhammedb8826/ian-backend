import { Injectable } from '@nestjs/common';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService){}
 async create(createCommissionDto: CreateCommissionDto) {
  const createdCommission = await this.prisma.commissions.create({
    data: {
      orderId: createCommissionDto.orderId,
      salesPartnerId: createCommissionDto.salesPartnerId,
      totalAmount: parseFloat(createCommissionDto.totalAmount.toString()),
      paidAmount: parseFloat(createCommissionDto.paidAmount.toString()),
      transactions: {
        create: createCommissionDto.transactions.map(transaction => ({
          date: transaction.date,
          paymentMethod: transaction.paymentMethod,
          reference: transaction.reference,
          amount: transaction.amount,
          status: transaction.status,
          percentage: transaction.percentage,
          description: transaction.description,
        }))
      }
    },
    include: {
      transactions: true,
    }
  });

  return createdCommission;
  }

 async findAll(skip: number, take: number) {
  const [commissions, total] = await this.prisma.$transaction([
    this.prisma.commissions.findMany({
      skip: Number(skip),
      take: Number(take),
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        salesPartner: true,
        transactions: true,
        order: true
      }
    }),
    this.prisma.commissions.count()
  ])
  return {
    commissions,
    total
  }
  }

  async findAllCommissions() {
    return this.prisma.commissions.findMany({
      include: {
        salesPartner: true,
        transactions: true,
        order: true
      }
    })
  }
 async findOne(id: string) {
    return this.prisma.commissions.findUnique({
      where: {id},
      include: {
        transactions: true,
        salesPartner: true,
        order: true
      }
    });
  }

  async update(id: string, updateCommissionDto: UpdateCommissionDto) {
    const { totalAmount, paidAmount } = updateCommissionDto;
  
    // // Validate that paidAmount is not below zero or greater than totalAmount
    // if (parseFloat(paidAmount.toString()) < 0) {
    //   throw new ConflictException('Paid amount cannot be below zero.');
    // }
    
    // if (parseFloat(paidAmount.toString()) > totalAmount) {
    //   throw new ConflictException('Paid amount cannot exceed the total amount.');
    // }
  
    // // Check if totalAmount equals paidAmount
    // const isPaid = totalAmount === parseFloat(paidAmount.toString());
  
    const updatedCommission = await this.prisma.commissions.update({
      where: {
        id: updateCommissionDto.id,
      },
      data: {
        orderId: updateCommissionDto.orderId,
        salesPartnerId: updateCommissionDto.salesPartnerId,
        totalAmount: totalAmount,
        paidAmount: parseFloat(paidAmount.toString()),
        transactions: {
          updateMany: updateCommissionDto.transactions.map(transaction => ({
            where: { id: transaction.id },
            data: {
              date: transaction.date,
              paymentMethod: transaction.paymentMethod,
              reference: transaction.reference,
              amount: transaction.amount,
              percentage: transaction.percentage,
              status: transaction.status, // Set status to 'paid' if amounts match
              description: transaction.description,
            },
          })),
        },
      },
    });
  
    return updatedCommission;
  }
  

 async remove(id: string) {
    return await this.prisma.commissions.delete({
      where: {id}
    });
  }
}
