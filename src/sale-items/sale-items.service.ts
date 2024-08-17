import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleItemDto } from './dto/create-sale-item.dto';
import { UpdateSaleItemDto } from './dto/update-sale-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SaleItemsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createSaleItemDto: CreateSaleItemDto) {
    const saleItem = this.prisma.saleItems.create({
      data: createSaleItemDto as unknown as Prisma.SaleItemsCreateInput,
    });
    return saleItem;
  }

  async findAll(saleId: string) {
    const saleItems = this.prisma.saleItems.findMany({
      where: { saleId },
      include: {
        notes: true,
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
                newQuantity = relatedItem.quantity - saleItem.quantity;
            } else if (updateSaleItemDto.status === 'Sold') {
                newQuantity = relatedItem.quantity + saleItem.quantity;
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
                data:{
                    ...updateSaleItemDto,
                },
                include: { item: true },
            });

            return updatedSaleItem;
        } catch (error) {
            if (error.code === 'P2002') { // Unique constraint error code
                throw new ConflictException('Unique constraint failed. Please check your data.');
            }
            throw new error('An unexpected error occurred.');
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
}
