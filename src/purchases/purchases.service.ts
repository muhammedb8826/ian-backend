import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createPurchaseDto: CreatePurchaseDto) {
    const { items, ...purchaseData } = createPurchaseDto;
    try {
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
    } catch (error) {
      if (error.code === 'P2002') { // Prisma unique constraint error code
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }
      throw new error('An unexpected error occurred.');
    }

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

  async findOne(id: string) {
    return this.prisma.purchases.findUnique({
      where: { id },
      include: {
        items: {
          include: { notes: true },
        },
        vendor: true,
        purchaseRepresentative: true,
      },
    });
  }

  async update(id: string, updatePurchaseDto: UpdatePurchaseDto) {
    const { items, ...purchaseData } = updatePurchaseDto;

    // Fetch the existing purchase and its items
    const existingPurchase = await this.prisma.purchases.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingPurchase) {
      throw new Error(`Purchase with ID ${id} not found`);
    }

    // Extract existing item IDs for comparison
    const existingItemIds = existingPurchase.items.map(item => item.id);
    const newItemIds = items.map(item => item.id);

    // Determine which items need to be deleted (those not in the new items list)
    const itemsToDelete = existingItemIds.filter(id => !newItemIds.includes(id));

    // Perform the update operation
    try {
      const updatedPurchase = await this.prisma.purchases.update({
        where: { id },
        data: {
          ...purchaseData,
          items: {
            deleteMany: { id: { in: itemsToDelete } }, // Delete items not in the new list
            upsert: items.map(item => ({
              where: { id: item.id || '' }, // Use upsert to create or update items
              update: {
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
                description: item.description,
                status: item.status,
              },
              create: {
                itemId: item.itemId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
                description: item.description,
                status: item.status,
              },
            })),
          },
        },
        include: {
          items: true,
          vendor: true,
          purchaseRepresentative: true,
        },
      });

      return updatedPurchase;
    } catch (error) {
      if (error.code === 'P2002') { // Prisma unique constraint error code
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }
      throw new error('An unexpected error occurred.');
    }
  }

  async remove(id: string) {
    // Fetch the purchase along with associated items
    const purchase = await this.prisma.purchases.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    if (purchase.items.length > 0) {
      // Notify user that the purchase cannot be deleted because it has associated items
      throw new BadRequestException(`Cannot delete purchase with ID ${id} because it has associated items.`);
    }

    const deletedPurchase = await this.prisma.purchases.delete({
      where: { id },
    });

    return deletedPurchase;
  }
}
