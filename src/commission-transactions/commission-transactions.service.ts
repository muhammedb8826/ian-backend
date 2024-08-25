import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCommissionTransactionDto } from './dto/create-commission-transaction.dto';
import { UpdateCommissionTransactionDto } from './dto/update-commission-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommissionTransactionsService {
  constructor(private prisma: PrismaService){}
  async create(createCommissionTransactionDto: CreateCommissionTransactionDto) {
    try {
      return this.prisma.commissionTransactions.create({
        data: {
          orderId: createCommissionTransactionDto.orderId,
          commissionId: createCommissionTransactionDto.commissionId,
          amount: createCommissionTransactionDto.amount,
          paymentMethod: createCommissionTransactionDto.paymentMethod,
          percentage: createCommissionTransactionDto.percentage,
          status: createCommissionTransactionDto.status,
          description: createCommissionTransactionDto.description,
          date: new Date(createCommissionTransactionDto.date),
          reference: createCommissionTransactionDto.reference,
        }
      })
    } catch (error) {
      console.error('Error creating commission transaction:', error);
  
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

  async findAll() {
    return this.prisma.commissionTransactions.findMany({
      include: {
        commission: {
          include: {
            salesPartner: true,
            order: true
          }
        }
      }
    });
  }

 async findOne(id: string) {
    return this.prisma.commissionTransactions.findUnique({
      where: {id},
      include: {
        commission: {
          include: {
            salesPartner: true,
            order: true
          }
        }
      }
    });
  }

  async update(id: string, updateCommissionTransactionDto: UpdateCommissionTransactionDto) {
    return this.prisma.commissionTransactions.update({
      where: { id },
      data: {
        date: new Date(updateCommissionTransactionDto.date), // Ensuring the date is correctly parsed
        paymentMethod: updateCommissionTransactionDto.paymentMethod,
        reference: updateCommissionTransactionDto.reference,
        amount: parseFloat(updateCommissionTransactionDto.amount.toString()), // Ensuring the amount is a valid float
        status: updateCommissionTransactionDto.status,
        description: updateCommissionTransactionDto.description || null, // Handling optional description
        orderId: updateCommissionTransactionDto.orderId,
        commissionId: updateCommissionTransactionDto.commissionId,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.commissionTransactions.delete({
      where: {id}
    });
  }
}
