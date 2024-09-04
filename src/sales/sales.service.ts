import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createSaleDto: CreateSaleDto) {
    const { saleItems, ...saledata } = createSaleDto;

    try {
        // Fetch the relevant items from the database
        for (const item of saleItems) {
            const relatedItem = await this.prisma.items.findUnique({
                where: { id: item.itemId },
                select: { quantity: true, name: true },
            });

            if (!relatedItem) {
              throw new NotFoundException(`Item with ID ${item.itemId} not found.`);
          }

          if (item.status === 'Requested' && relatedItem.quantity < item.unit) {
            throw new ConflictException(`Requested quantity is more than available quantity for item "${relatedItem.name}"`);
          }
        }

        // If all validations pass, proceed with the sale creation
        const sale = await this.prisma.sales.create({
            data: {
                series: saledata.series,
                operatorId: saledata.operatorId,
                status: saledata.status,
                orderDate: new Date(saledata.orderDate),
                totalQuantity: parseFloat(saledata.totalQuantity.toString()),
                note: saledata.note,
                saleItems: {
                    create: saleItems.map(item => ({
                        itemId: item.itemId,
                        uomId: item.uomId,
                        quantity: item.quantity,
                        description: item.description,
                        status: item.status,
                        unit: parseFloat(item.unit.toString()),
                        baseUomId: item.baseUomId,
                    })),
                },
            },
        });

        return sale;
    } catch (error) {
      console.error("Error creating sale:", error);

      // Re-throw the ConflictException as is
      if (error instanceof ConflictException || error instanceof NotFoundException) {
          throw error;
      }

      // Check if it's a Prisma error
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error('Prisma error details:', error.meta);
          throw new ConflictException('Database error occurred. Please check your data.');
      }

      // For any other unexpected errors, rethrow the original error
      throw new ConflictException(`An unexpected error occurred: ${error.message}`);
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
    const {saleItems, ...saledata } = updateSaleDto;

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

      // Validate each sale item
      for (const item of saleItems) {
        const relatedItem = await this.prisma.items.findUnique({
            where: { id: item.itemId },
            select: { quantity: true, name: true }, // Fetch quantity and name
        });

        if (!relatedItem) {
            throw new NotFoundException(`Item with ID ${item.itemId} not found.`);
        }

        if (item.status === 'Requested' && relatedItem.quantity < item.unit) {
            throw new ConflictException(`Requested quantity is more than available quantity for item "${relatedItem.name}"`);
        }
    }




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
                uomId: item.uomId,
                quantity: item.quantity,
                description: item.description,
                status: item.status,
                baseUomId: item.baseUomId,
                unit: parseFloat(item.unit.toString()),
              },
              create: {
                itemId: item.itemId,
                uomId: item.uomId,
                quantity: item.quantity,
                description: item.description,
                status: item.status,
                baseUomId: item.baseUomId,
                unit: parseFloat(item.unit.toString()),
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
// Re-throw the ConflictException as is
if (error instanceof ConflictException || error instanceof NotFoundException) {
  throw error;
}

   // Check if it's a Prisma error
   if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error('Prisma error details:', error.meta);
    throw new ConflictException('Database error occurred. Please check your data.');
}

// For any other unexpected errors, rethrow the original error
throw new ConflictException(`An unexpected error occurred: ${error.message}`);
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
