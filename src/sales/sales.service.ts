import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createSaleDto: CreateSaleDto) {
    const { items, ...saledata } = createSaleDto;
    try{
      const sale = await this.prisma.sales.create({
        data: {
          series: saledata.series,
          operatorId: saledata.operatorId,
          status: saledata.status,
          orderDate: saledata.orderDate,
          paymentMethod: saledata.paymentMethod || 'Cash',
          amount: saledata.amount,
          reference: saledata.reference || '',
          totalAmount: saledata.totalAmount,
          totalQuantity: saledata.totalQuantity,
          note: saledata.note,
          items: {
            create: items.map(item => ({
              itemId: item.itemId,
              unitId: item.unitId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
              description: item.description,
              status: item.status,
              notes: {
                create: item.notes.map(note => ({
                  text: note.text,
                  userId: note.userId,
                  date: note.date,
                  hour: note.hour,
                })),
              },
            })),
          },
        },
        include: {
          items: {
            include: {
              notes: true,
            },
          },
          operator: true,
        },
      })
      return sale
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
          items: {
            include: {
              notes: true
            }
          },
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
        items: {
          include : {
            notes: true
          }
        },
        operator: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.sales.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            notes: true,
          },
        },
        operator: true,
      },
    });
  }

  async update(id: string, updateSaleDto: UpdateSaleDto) {
    const { items, ...saledata } = updateSaleDto;
  
    // Fetch the existing sale and its items
    const existingSale = await this.prisma.sales.findUnique({
      where: { id },
      include: { items: true },
    });
  
    if (!existingSale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
  
    // Extract existing item IDs for comparison
    const existingItemIds = existingSale.items.map(item => item.id);
    const newItemIds = items.map(item => item.id);
  
    // Determine which items need to be deleted (those not in the new items list)
    const itemsToDelete = existingItemIds.filter(id => !newItemIds.includes(id));
  
    try {
      const updatedSale = await this.prisma.sales.update({
        where: { id },
        data: {
          ...saledata,
          items: {
            // Delete items that are no longer present in the update request
            deleteMany: {
              id: {
                in: itemsToDelete,
              },
            },
            // Update existing items or create new items as needed
            upsert: items.map(item => ({
              where: { id: item.id },
              update: {
                itemId: item.itemId,
                unitId: item.unitId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
                description: item.description,
                status: item.status,
                notes: {
                  updateMany: item.notes.map(note => ({
                    where: { id: note.id },
                    data: {
                      text: note.text,
                      date: note.date,
                      hour: note.hour,
                    },
                  })),
                },
              },
              create: {
                itemId: item.itemId,
                unitId: item.unitId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
                description: item.description,
                status: item.status,
                notes: {
                  create: item.notes.map(note => ({
                    text: note.text,
                    userId: note.userId,
                    date: note.date,
                    hour: note.hour,
                  })),
                },
              },
            })),
          },
        },
        include: {
          items: {
            include: {
              notes: true,
            },
          },
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
        items: true,
      },
    });

    if (!sale) {
      throw new Error(`Sale with ID ${id} not found`);
    }

    if(sale.items.length > 0) {
      throw new ConflictException('Sale has items and cannot be deleted');
    }

    const deletedSale = await this.prisma.sales.delete({
      where: { id },
    });

    return deletedSale;
  }
}
