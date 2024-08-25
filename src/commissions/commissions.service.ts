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
        salesPartnerId: createCommissionDto.salesPartnerId,
      }
    })
  }

 async findAll() {
    return this.prisma.commissions.findMany({
      include: {
        transactions : true
      }
    });
  }

 async findOne(id: string) {
    return this.prisma.commissions.findUnique({
      where: {id},
      include: {
        transactions: true
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
      }
    })
  }

 async remove(id: string) {
    return this.prisma.commissions.delete({
      where: {id}
    });
  }
}
