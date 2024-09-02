import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleItemDto } from './dto/create-sale-item.dto';
import { UpdateSaleItemDto } from './dto/update-sale-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SaleItemsService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createSaleItemDto: CreateSaleItemDto) {
    try {
      const saleItem = await this.prisma.saleItems.create({
        data: {
          saleId: createSaleItemDto.saleId,
          itemId: createSaleItemDto.itemId,
          uomId: createSaleItemDto.uomId,
          quantity: parseFloat(createSaleItemDto.quantity.toString()),
          description: createSaleItemDto.description,
          status: createSaleItemDto.status,
        },
      });

      // Schedule status change if initially set to 'Stocked-out'
      if (saleItem.status === 'Stocked-out') {
        this.scheduleStatusChange(saleItem.id, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
      }

      return saleItem;
    } catch (error) {
      console.error('Error creating Sale Item:', error);

      if (error.code === 'P2002') {
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error details:', error.meta);
      }

      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }

  async findAll(saleId: string) {
    const saleItems = this.prisma.saleItems.findMany({
      where: { saleId },
      include: {
        sale: true,
        item: true,
        saleItemNotes: {
          include: {
            user: true,
          },
        },
      }
    });
    return saleItems;
  }

  async update(id: string, updateSaleItemDto: UpdateSaleItemDto) {
    // Start transaction to ensure consistency
    return await this.prisma.$transaction(async (prisma) => {
      try {
        // Fetch the sale item being updated
        const saleItem = await prisma.saleItems.findUnique({
          where: { id },
          include: { item: true }, // Fetch the associated item
        });

        if (!saleItem) {
          throw new NotFoundException(`Sale Item with ID ${id} not found`);
        }

        // Fetch the related item
        const relatedItem = saleItem.item;

        if (!relatedItem) {
          throw new NotFoundException(`Related item not found for Sale Item with ID ${id}`);
        }

        // Calculate the new quantity based on the status
        let newQuantity = relatedItem.quantity;
        if (updateSaleItemDto.status === 'Cancelled') {
          newQuantity = relatedItem.quantity + saleItem.quantity;

          // Check if operator stock exists and reduce its quantity
          const operatorStock = await prisma.operatorStock.findFirst({
            where: { itemId: relatedItem.id, status: 'Active' }, // Adjust this query to match your conditions
          });

          if (operatorStock) {
            // Decrement the operator stock quantity
            await prisma.operatorStock.update({
              where: { id: operatorStock.id },
              data: {
                quantity: operatorStock.quantity - saleItem.quantity,
              },
            });
          }


        } else if (updateSaleItemDto.status === 'Stocked-out') {
          newQuantity = relatedItem.quantity - saleItem.quantity;

          // Check if operator stock exists
          const operatorStock = await prisma.operatorStock.findFirst({
            where: { itemId: relatedItem.id, status: 'Active' }, // Adjust this query to match your conditions
          });

          if (operatorStock) {
            // Increment the operator stock quantity
            await prisma.operatorStock.update({
              where: { id: operatorStock.id },
              data: {
                quantity: operatorStock.quantity + saleItem.quantity,
              },
            });
          } else {
            // Create new operator stock if it doesn't exist
            await prisma.operatorStock.create({
              data: {
                itemId: relatedItem.id,
                uomId: saleItem.uomId,
                quantity: saleItem.quantity,
                description: `Stocked-out for Sale Item ${saleItem.id}`,
                status: 'Active', // Adjust the status as needed
              },
            });
          }
          
          this.scheduleStatusChange(id, 24 * 60 * 60 * 1000);

        }

        // Ensure that quantity cannot drop below zero
        if (newQuantity < 0) {
          throw new ConflictException(`Quantity cannot drop below zero for Sale Item with ID ${id}`);
        }

        // Update the related item with the new quantity
        await prisma.items.update({
          where: { id: relatedItem.id },
          data: { quantity: newQuantity },
        });


        // Update the sale item
        const updatedSaleItem = await prisma.saleItems.update({
          where: { id },
          data: {
            quantity: parseFloat(updateSaleItemDto.quantity.toString()),
            description: updateSaleItemDto.description,
            status: updateSaleItemDto.status,
          },
          include: { saleItemNotes: true },
        });
        

        return updatedSaleItem;
      } catch (error) {
        console.error('Error during Sale Item update:', error);

        // Customize the error response to match frontend expectations
        if (error instanceof ConflictException) {
          throw new ConflictException({
            statusCode: 409,
            message: error.message,
            error: 'Conflict',
          });
        }


        if (error.code === 'P2002') {
          throw new ConflictException({
            statusCode: 409,
            message: 'Unique constraint failed. Please check your data.',
            error: 'Conflict',
          });
        }

        throw new Error('An unexpected error occurred: ' + error.message);
      }
    });
  }

  async remove(id: string) {
    // Fetch the sale item along with associated item
    const saleItem = await this.prisma.saleItems.findUnique({
      where: { id },
      include: { item: true },
    });

    if (!saleItem) {
      throw new NotFoundException(`Sale Item with ID ${id} not found`);
    }

    // Fetch the related item
    const relatedItem = saleItem.item;

    if (!relatedItem) {
      throw new NotFoundException(`Related item not found for Sale Item with ID ${id}`);
    }

    // Calculate the new quantity
    const newQuantity = relatedItem.quantity - saleItem.quantity;

    // Ensure that quantity cannot drop below zero
    if (newQuantity < 0) {
      throw new ConflictException(`Quantity cannot drop below zero for Sale Item with ID ${id}`);
    }

    // Update the related item with the new quantity
    await this.prisma.items.update({
      where: { id: relatedItem.id },
      data: { quantity: newQuantity },
    });

    // Delete the sale item
    const deletedSaleItem = await this.prisma.saleItems.delete({
      where: { id },
    });

    return deletedSaleItem;
  }


  private async scheduleStatusChange(id: string, delay: number) {
    setTimeout(async () => {
      const saleItem = await this.prisma.saleItems.findUnique({
        where: { id },
        select: { status: true },
      });

      if (saleItem?.status === 'Stocked-out') {
        await this.prisma.saleItems.update({
          where: { id },
          data: { status: 'Sent' },
        });
      }
    }, delay);
  }
}
