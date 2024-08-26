import { Injectable } from '@nestjs/common';
import { CreatePaymentTermDto } from './dto/create-payment-term.dto';
import { UpdatePaymentTermDto } from './dto/update-payment-term.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentTermsService {
  constructor(private prisma: PrismaService){}
  async create(createPaymentTermDto: CreatePaymentTermDto) {
    return await this.prisma.paymentTerms.create({
      data: {
        totalAmount: createPaymentTermDto.totalAmount,
        remainingAmount: createPaymentTermDto.remainingAmount,
        forcePayment: createPaymentTermDto.forcePayment,
        status: createPaymentTermDto.status,
        orderId: createPaymentTermDto.orderId,
      }
    })
  }

  async findAll() {
    return await this.prisma.paymentTerms.findMany({
      include: {
        transactions: true
      }
    });
  }

  async findOne(id: string) {
    return await this.prisma.paymentTerms.findUnique({
      where: {id},
      include: {
        transactions: true
      }
    });
  }

  async update(id: string, updatePaymentTermDto: UpdatePaymentTermDto) {
    return this.prisma.paymentTerms.update({
      where: { id },
      data: {
        totalAmount: updatePaymentTermDto.totalAmount,
        remainingAmount: updatePaymentTermDto.remainingAmount,
        forcePayment: updatePaymentTermDto.forcePayment,
        status: updatePaymentTermDto.status,
        orderId: updatePaymentTermDto.orderId,
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.paymentTerms.delete({
      where: {id}
    });
  }
}
