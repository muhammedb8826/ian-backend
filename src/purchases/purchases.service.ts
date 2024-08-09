import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createPurchaseDto: CreatePurchaseDto) {
    return this.prisma.purchases.create({
      data: {
        series: createPurchaseDto.series,
        vendorId: createPurchaseDto.vendorId,
        purchaseRepresentativeId: createPurchaseDto.purchaseRepresentativeId,
        status: createPurchaseDto.status,
        orderDate: createPurchaseDto.orderDate,
        paymentMethod: createPurchaseDto.paymentMethod,
        amount: createPurchaseDto.amount,
        reference: createPurchaseDto.reference,
        totalAmount: createPurchaseDto.totalAmount,
        totalQuantity: createPurchaseDto.totalQuantity,
        note: createPurchaseDto.note,
        items: {
          create: createPurchaseDto.items.map(item => ({
            purchaseId: item.purchaseId,
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            description: item.description,
            status: item.status,
            id: item.id,
          })),
        },
      },
    });
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
    const { items, ...rest } = updatePurchaseDto;

  // Update the purchase
  const updatedPurchase = await this.prisma.purchases.update({
    where: { id },
    data: rest,
  });

  if (items) {
    await this.prisma.purchaseItems.deleteMany({
      where: { purchaseId: id },
    });

    await this.prisma.purchaseItems.createMany({
      data: items.map(item => ({
        purchaseId: id,
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        description: item.description,
        status: item.status,
        id: item.id
      })),
    });
  }

  return updatedPurchase;
}

 async remove(id: string) {
    const purchase = await this.prisma.purchases.delete({
      where: { id },
    });
    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }
    return purchase;
  }
}
