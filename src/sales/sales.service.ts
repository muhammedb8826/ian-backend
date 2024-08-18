import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
              status: item.status
            })),
          },
        },
        include: {
          items: true,
          operator: true,
        },
      })
      return sale
    } catch (error) {
      console.error(error);
      if (error.code === 'P2002') { // Prisma unique constraint error code
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }
      throw new Error('An unexpected error occurred.');
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
          items: true,
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
        items: true,
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

 // Fetch the existing purchase and its items
 const existingSale = await this.prisma.sales.findUnique({
  where: { id },
  include: { items: true },
});

if (!existingSale) {
  throw new Error(`Sale with ID ${id} not found`);
}

// Extract existing item IDs for comparison
const existingItemIds = existingSale.items.map(item => item.id);
const newItemIds = items.map(item => item.id);

// Determine which items need to be deleted (those not in the new items list)
const itemsToDelete = existingItemIds.filter(id => !newItemIds.includes(id));

// Perform the update operation
try {
  const updatedSale = await this.prisma.sales.update({
    where: { id },
    data: {
      ...saledata,
      items: {
        deleteMany: { id: { in: itemsToDelete}},
        upsert: items.map(item => ({
          where: { id: item.id || '' },
          create: {
            itemId: item.itemId,
            unitId: item.unitId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            description: item.description,
            status: item.status
          },
          update: {
            unitId: item.unitId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            description: item.description,
            status: item.status
          },
        })),
      },
    },
    include: {
      items: true,
      operator: true,
    },
  });
  return updatedSale;
} catch (error) {
  if (error.code === 'P2002') { // Prisma unique constraint error code
    throw new ConflictException('Unique constraint failed. Please check your data.');
  }
  throw new Error('An unexpected error occurred.');
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
