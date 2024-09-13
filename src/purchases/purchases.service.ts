import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createPurchaseDto: CreatePurchaseDto) {
    const { vendorId, purchaserId, ...purchaseData } = createPurchaseDto;
    try {
      const purchase = await this.prisma.purchases.create({
        data: {
          series: purchaseData.series,
          status: purchaseData.status,
          orderDate: new Date(purchaseData.orderDate),
          paymentMethod: purchaseData.paymentMethod,
          amount: parseFloat(purchaseData.amount.toString()),
          reference: purchaseData.reference,
          totalAmount: parseFloat(purchaseData.totalAmount.toString()),
          totalQuantity: parseFloat(purchaseData.totalQuantity.toString()),
          note: purchaseData.note,
          purchaseItems: {
            create: createPurchaseDto.purchaseItems.map(item => ({
              itemId: item.itemId,
              uomId: item.uomId,
              baseUomId: item.baseUomId,
              unit: parseFloat(item.unit.toString()),
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
              description: item.description,
              status: item.status,
            })),
          },
          vendor: {
            connect: { id: vendorId },
          },
          purchaser: {
            connect: { id: purchaserId },
          }
        },
      });
      return purchase;

    } catch (error) {
      console.error("Error creating purchase:", error);

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

  async findAll(skip: number, take: number, search?: string, startDate?: string, endDate?: string, item1?: string, item2?: string, item3?: string) {
    const whereClause: any = {};

    // Handle the search filter
    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { series: { contains: search, mode: 'insensitive' } },
        { vendor: { fullName: { contains: search, mode: 'insensitive' } } },
        { vendor: { phone: { contains: search, mode: 'insensitive' } } },
        { purchaseItems: { some: { description: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // Handle the date range filter
    if (startDate && endDate) {
      whereClause.orderDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Collect the provided item names into an array
    const purchaseItemNames = [item1, item2, item3].filter(Boolean); // Filters out undefined or null values

    // Handle order item names filter
    if (purchaseItemNames.length > 0) {
      whereClause.purchaseItems = {
        some: {
          item: {
            OR: purchaseItemNames.map(name => ({
              name: {
                contains: name, // Case-insensitive search in lowercase
                mode: 'insensitive',
              }
            }))
          }
        }
      };
    }

    const [purchases, total, grandTotalSum] = await this.prisma.$transaction([
      this.prisma.purchases.findMany({
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          vendor: true,
          purchaseItems: true,
          purchaser: true
        },
        where: whereClause, // Use the unified whereClause
      }),
      this.prisma.purchases.count({
        where: whereClause, // Use the same whereClause for count
      }),
      this.prisma.purchases.aggregate({
        _sum: {
          amount: true,
        },
        where: whereClause, // Use the same whereClause for sum
      }),
    ]);
    return {
      purchases,
      total,
      grandTotalSum: grandTotalSum._sum.amount ?? 0, // Return the sum of grandTotal or 0 if no orders found
    };
  }

  async findAllPurchases() {
    return this.prisma.purchases.findMany({
      include: {
        vendor: true,
        purchaser: true,
        purchaseItems: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.purchases.findUnique({
      where: { id },
      include: {
        purchaseItems: true,
        vendor: true,
        purchaser: true,
      },
    });
  }

  async update(id: string, updatePurchaseDto: UpdatePurchaseDto) {
    const { ...purchaseData } = updatePurchaseDto;

    // Fetch the existing purchase and its items
    const existingPurchase = await this.prisma.purchases.findUnique({
      where: { id },
      include: { purchaseItems: true },
    });

    if (!existingPurchase) {
      throw new Error(`Purchase with ID ${id} not found`);
    }

    // Extract existing item IDs for comparison
    const existingItemIds = existingPurchase.purchaseItems.map(item => item.id);
    const newItemIds = updatePurchaseDto.purchaseItems.map(item => item.id);

    // Determine which items need to be deleted (those not in the new items list)
    const itemsToDelete = existingItemIds.filter(id => !newItemIds.includes(id));

    // Perform the update operation
    try {
      const updatedPurchase = await this.prisma.purchases.update({
        where: { id },
        data: {
          ...purchaseData,
          purchaseItems: {
            deleteMany: { id: { in: itemsToDelete } }, // Delete items not in the new list
            upsert: updatePurchaseDto.purchaseItems.map(item => ({
              where: { id: item.id || '' }, // Use upsert to create or update items
              update: {
                quantity: item.quantity,
                uomId: item.uomId,
                baseUomId: item.baseUomId,
                unit: parseFloat(item.unit.toString()),
                unitPrice: parseFloat(item.unitPrice.toString()),
                amount: item.amount,
                description: item.description,
                status: item.status,
              },
              create: {
                itemId: item.itemId,
                uomId: item.uomId,
                baseUomId: item.baseUomId,
                unit: parseFloat(item.unit.toString()),
                quantity: item.quantity,
                unitPrice: parseFloat(item.unitPrice.toString()),
                amount: item.amount,
                description: item.description,
                status: item.status,
              },
            })),
          },
        },
        include: {
          purchaseItems: true,
          vendor: true,
          purchaser: true,
        },
      });

      return updatedPurchase;
    } catch (error) {
      console.error('Error updating purchase:', error);
      if (error.code === 'P2002') { // Prisma unique constraint error code
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error details:', error.meta);
      }
      throw new Error('An unexpected error occurred.');
    }
  }

  async remove(id: string) {
    // Fetch the purchase along with associated items
    const purchase = await this.prisma.purchases.findUnique({
      where: { id },
      include: { purchaseItems: true },
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    if (purchase.purchaseItems.length > 0) {
      // Notify user that the purchase cannot be deleted because it has associated items
      throw new BadRequestException(`Cannot delete purchase with ID ${id} because it has associated items.`);
    }

    const deletedPurchase = await this.prisma.purchases.delete({
      where: { id },
    });

    return deletedPurchase;
  }
}
