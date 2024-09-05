import { Injectable } from '@nestjs/common';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService){}
 async create(createCommissionDto: CreateCommissionDto) {
    return await this.prisma.commissions.create({
      data: {
        orderId: createCommissionDto.orderId,
        totalAmount: createCommissionDto.totalAmount,
        paidAmount: createCommissionDto.paidAmount,
        salesPartnerId: createCommissionDto.salesPartnerId,
      }
    })
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
    return this.prisma.commissions.update({
      where: { id },
      data: {
        orderId: updateCommissionDto.orderId,
        totalAmount: updateCommissionDto.totalAmount,
        salesPartnerId: updateCommissionDto.salesPartnerId,
        paidAmount: updateCommissionDto.paidAmount
      }
    })
  }

 async remove(id: string) {
    return this.prisma.commissions.delete({
      where: {id}
    });
  }
}
