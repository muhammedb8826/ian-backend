import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createSaleDto: CreateSaleDto) {
    const { ...saledata } = createSaleDto;
    try {
      const sale = await this.prisma.sales.create({
        data: {
          series: saledata.series,
          operatorId: saledata.operatorId,
          status: saledata.status,
          orderDate: new Date(saledata.orderDate),
          paymentMethod: saledata.paymentMethod || 'Cash',
          amount: parseFloat(saledata.amount.toString()),
          reference: saledata.reference || '',
          totalAmount: parseFloat(saledata.totalAmount.toString()),
          totalQuantity: parseFloat(saledata.totalQuantity.toString()),
          note: saledata.note,
          saleItems: {
            create: createSaleDto.saleItems.map(item => ({
              itemId: item.itemId,
              unitId: item.unitId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
              description: item.description,
              status: item.status,
            })),
          },
        },
      })
      return sale;

    } catch (error) {
      console.error("Error creating sale:", error);

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

  async findAll(skip: number, take: number) {
    const [sales, total] = await this.prisma.$transaction([
      this.prisma.sales.findMany({
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          saleItems: true,
          operator: true,
        },
      }),
      this.prisma.sales.count()
    ]);
    return {
      sales,
      total
    }
  }

  async findAllSales() {
    return this.prisma.sales.findMany({
      include: {
        saleItems: true,
        operator: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.sales.findUnique({
      where: { id },
      include: {
        saleItems: true,
        operator: true,
      },
    });
  }

  async update(id: string, updateSaleDto: UpdateSaleDto) {
    const {...saledata } = updateSaleDto;

    // Fetch the existing sale and its items
    const existingSale = await this.prisma.sales.findUnique({
      where: { id },
      include: { saleItems: true },
    });

    if (!existingSale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    // Extract existing item IDs for comparison
    const existingItemIds = existingSale.saleItems.map(item => item.id);
    const newItemIds = updateSaleDto.saleItems.map(item => item.id);

    // Determine which items need to be deleted (those not in the new items list)
    const itemsToDelete = existingItemIds.filter(id => !newItemIds.includes(id));

    try {
      const updatedSale = await this.prisma.sales.update({
        where: { id },
        data: {
          ...saledata,
          saleItems: {
            // Delete items that are no longer present in the update request
            deleteMany: {
              id: {
                in: itemsToDelete,
              },
            },
            // Update existing items or create new items as needed
            upsert: updateSaleDto.saleItems.map(item => ({
              where: { id: item.id },
              update: {
                itemId: item.itemId,
                unitId: item.unitId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
                description: item.description,
                status: item.status,
              },
              create: {
                itemId: item.itemId,
                unitId: item.unitId,
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
          saleItems: true,
          operator: true,
        },
      });

      return updatedSale;
    } catch (error) {
      console.error("Error updating sale:", error);

      if (error.code === 'P2002') {
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }

      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }

  async remove(id: string) {
    const sale = await this.prisma.sales.findUnique({
      where: { id },
      include: {
        saleItems: true,
      },
    });

    if (!sale) {
      throw new Error(`Sale with ID ${id} not found`);
    }

    if (sale.saleItems.length > 0) {
      throw new ConflictException('Sale has items and cannot be deleted');
    }

    const deletedSale = await this.prisma.sales.delete({
      where: { id },
    });

    return deletedSale;
  }
}
