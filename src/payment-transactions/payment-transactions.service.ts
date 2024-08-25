import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePaymentTransactionDto } from './dto/create-payment-transaction.dto';
import { UpdatePaymentTransactionDto } from './dto/update-payment-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentTransactionsService {
  constructor(private prisma: PrismaService){}
  async create(createPaymentTransactionDto: CreatePaymentTransactionDto) {
    try {
      return await this.prisma.paymentTransactions.create({
        data: {
          date: new Date(createPaymentTransactionDto.date), // Ensuring the date is correctly parsed
          paymentMethod: createPaymentTransactionDto.paymentMethod,
          reference: createPaymentTransactionDto.reference,
          amount: parseFloat(createPaymentTransactionDto.amount.toString()), // Ensuring the amount is a valid float
          status: createPaymentTransactionDto.status,
          description: createPaymentTransactionDto.description || null, // Handling optional description
          orderId: createPaymentTransactionDto.orderId,
          paymentTermId: createPaymentTransactionDto.paymentTermId,
        },
      });
    } catch (error) {
      console.error('Error creating payment transaction:', error);
  
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
    return this.prisma.paymentTransactions.findMany({
      include: {
        paymentTerm: {
          include: {
            order: true,
          }
        }
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.paymentTransactions.findUnique({
      where: {id},
      include: {
        paymentTerm: {
          include: {
            order: true,
          }
        }
      },
    });
  }

  async update(id: string, updatePaymentTransactionDto: UpdatePaymentTransactionDto) {
    return this.prisma.paymentTransactions.update({
      where: { id },
      data: {
        date: new Date(updatePaymentTransactionDto.date), // Ensuring the date is correctly parsed
        paymentMethod: updatePaymentTransactionDto.paymentMethod,
        reference: updatePaymentTransactionDto.reference,
        amount: parseFloat(updatePaymentTransactionDto.amount.toString()), // Ensuring the amount is a valid float
        status: updatePaymentTransactionDto.status,
        description: updatePaymentTransactionDto.description || null, // Handling optional description
        orderId: updatePaymentTransactionDto.orderId,
        paymentTermId: updatePaymentTransactionDto.paymentTermId,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.paymentTransactions.delete({
      where: {id}
    });
  }
}
