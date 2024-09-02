import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseItemDto } from './dto/create-purchase-item.dto';
import { UpdatePurchaseItemDto } from './dto/update-purchase-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchaseItemsService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createPurchaseItemDto: CreatePurchaseItemDto) {
    try{
      return await this.prisma.purchaseItems.create({
        data: {
          purchaseId: createPurchaseItemDto.purchaseId,
          itemId: createPurchaseItemDto.itemId,
          uomId: createPurchaseItemDto.uomId,
          quantity: parseFloat(createPurchaseItemDto.quantity.toString()),
          unitPrice: parseFloat(createPurchaseItemDto.unitPrice.toString()),
          amount: parseFloat(createPurchaseItemDto.amount.toString()),
          description: createPurchaseItemDto.description,
          status: createPurchaseItemDto.status,
        },
      })
    } catch (error) {
      console.error('Error creating purchase item:', error);

      if (error.code === 'P2002') {
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error details:', error.meta);
      }

      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }

  async findAll(purchaseId: string) {
    const purchaseItems = await this.prisma.purchaseItems.findMany({
      where: { purchaseId },
      include: {
        purchase: true,
        item: true,
        purchaseItemNotes: {
          include: {
            user: true,
          },
        },
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


        switch (updatePurchaseItemDto.status) {
        case 'Cancelled':
          newQuantity -= purchaseItem.quantity;
          break;
        case 'Received':
          newQuantity += purchaseItem.quantity;
          break;
        // Add other statuses if needed
        default:
          break;
      }

        // Ensure that quantity cannot drop below zero
        if (newQuantity < 0) {
          throw new ConflictException(`Item quantity cannot be less than zero.`);
        }

        // Update the item with the new quantity
        await prisma.items.update({
          where: { id: relatedItem.id },
          data: {
            quantity: newQuantity,
          },
        });

        const updateData = {
          quantity: parseFloat(updatePurchaseItemDto.quantity.toString()),
          unitPrice: parseFloat(updatePurchaseItemDto.unitPrice.toString()),
          status: updatePurchaseItemDto.status,
        };
        
        const updatedPurchaseItem = await prisma.purchaseItems.update({
          where: { id },
          data: updateData,
          include: { purchaseItemNotes: true },
        });
  
        return updatedPurchaseItem;
      } catch (error) {
        console.log('Error updating purchase item:', error);
  
        if (error.code === 'P2002') {
          throw new ConflictException('Unique constraint failed. Please check your data.');
        }
  
        throw new Error('An unexpected error occurred: ' + error.message);
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
