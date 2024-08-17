import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseItemDto } from './dto/create-purchase-item.dto';
import { UpdatePurchaseItemDto } from './dto/update-purchase-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchaseItemsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createPurchaseItemDto: CreatePurchaseItemDto) {
    const purchaseItem = await this.prisma.purchaseItems.create({
      data: createPurchaseItemDto as unknown as Prisma.PurchaseItemsCreateInput,
    });

    return purchaseItem;
  }

  async findAll(purchaseId: string) {
    const purchaseItems = await this.prisma.purchaseItems.findMany({
      where: { purchaseId },
      include: {
        notes: true,
      }
    });

    return purchaseItems;
  }


  async update(id: string, updatePurchaseItemDto: UpdatePurchaseItemDto) {
    // Start transaction to ensure consistency
    return await this.prisma.$transaction(async (prisma) => {
        try {
            // Fetch the purchase item being updated
            const purchaseItem = await prisma.purchaseItems.findUnique({
                where: { id },
                include: { item: true }, // Fetch the associated item
            });

            if (!purchaseItem) {
                throw new NotFoundException(`Purchase Item with ID ${id} not found`);
            }

            // Fetch the related item
            const relatedItem = purchaseItem.item;

            if (!relatedItem) {
                throw new NotFoundException(`Related item not found for Purchase Item with ID ${id}`);
            }

            // Calculate the new quantity based on the status
            let newQuantity = relatedItem.quantity;
            if (updatePurchaseItemDto.status === 'Cancelled') {
                newQuantity = relatedItem.quantity - purchaseItem.quantity;
            } else if (updatePurchaseItemDto.status === 'Received') {
                newQuantity = relatedItem.quantity + purchaseItem.quantity;
            }

            // Ensure that quantity cannot drop below zero
            // if (newQuantity < 0) {
            //     throw new ConflictException(`Item quantity cannot be less than zero.`);
            // }

            // Update the item with the new quantity
            await prisma.items.update({
                where: { id: relatedItem.id },
                data: {
                    quantity: newQuantity,
                },
            });

            // Update the purchase item status
            const updatedPurchaseItem = await prisma.purchaseItems.update({
                where: { id },
                data: {
                    ...updatePurchaseItemDto,
                },
                include: {
                    item: true,
                },
            });

            return updatedPurchaseItem;
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Unique constraint failed. Please check your data.');
            }

            throw new error('An unexpected error occurred: ' + error.message);
        }
    });
}

  

 async remove(id: string) {
    const deletedPurchaseItem = await this.prisma.purchaseItems.delete({
      where: { id },
    });

    return deletedPurchaseItem;
  }
}
