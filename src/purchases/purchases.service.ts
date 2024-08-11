import { Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createPurchaseDto: CreatePurchaseDto) {
    const { items, ...purchaseData } = createPurchaseDto;
    const purchase = await this.prisma.purchases.create({
      data: {
        series: purchaseData.series,
        vendorId: purchaseData.vendorId,
        purchaseRepresentativeId: purchaseData.purchaseRepresentativeId,
        status: purchaseData.status,
        orderDate: purchaseData.orderDate,
        paymentMethod: purchaseData.paymentMethod,
        amount: purchaseData.amount,
        reference: purchaseData.reference,
        totalAmount: purchaseData.totalAmount,
        totalQuantity: purchaseData.totalQuantity,
        note: purchaseData.note,
        items: {
          create: items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            description: item.description,
            status: item.status,
          })),
        },
      },
      include: {
        items: true,
        vendor: true,
        purchaseRepresentative: true,
      },
    });
    return purchase;
  }

  async findAll(skip: number, take: number) {
   const [purchases, total] = await this.prisma.$transaction([
      this.prisma.purchases.findMany({
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc',
        },
        include: { 
          vendor: true,
          items: true,
          purchaseRepresentative: true 
        },
      }),
      this.prisma.purchases.count(),
    ]);
    return {
      purchases,
      total,
    };
  }

  async findAllPurchases() {
    return this.prisma.purchases.findMany({
      include: { vendor: true, purchaseRepresentative: true, items: true },
    });
  }

  async  findOne(id: string) {
    return this.prisma.purchases.findUnique({
      where: { id },
      include: {
        items: true,
        vendor: true,
        purchaseRepresentative: true,
      },
    });
  }

  async update(id: string, updatePurchaseDto: UpdatePurchaseDto) {
    const { items, ...purchaseData } = updatePurchaseDto;
  
    const updatedPurchase = await this.prisma.purchases.update({
      where: { id },
      data: {
        ...purchaseData,
        ...(items && {
          items: {
            deleteMany: {}, // Be cautious with this if not intended
            createMany: {
              data: items.map(item => ({
                itemId: item.itemId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
                description: item.description,
                status: item.status,
              })),
            },
          },
        }),
      },
      include: { 
        items: true,
        vendor: true,
        purchaseRepresentative: true
      },
    });
  
    return updatedPurchase;
  }


 async remove(id: string) {
  const deletedPurchase = await this.prisma.purchases.delete({
    where: { id },
    include: { items: true },
  });

  return deletedPurchase;
}
}
