import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
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
    });

    return purchaseItems;
  }


  async update(id: string, updatePurchaseItemDto: UpdatePurchaseItemDto) {
    try {
      const updatedPurchaseItem = await this.prisma.purchaseItems.update({
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
      if (error.code === 'P2002') { // Prisma unique constraint error code
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }
  
      throw new InternalServerErrorException('An unexpected error occurred: ' + error.message);
    }
  }
  

 async remove(id: string) {
    const deletedPurchaseItem = await this.prisma.purchaseItems.delete({
      where: { id },
    });

    return deletedPurchaseItem;
  }
}
