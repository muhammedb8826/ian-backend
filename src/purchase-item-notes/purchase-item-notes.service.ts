import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseItemNoteDto } from './dto/create-purchase-item-note.dto';
import { UpdatePurchaseItemNoteDto } from './dto/update-purchase-item-note.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PurchaseItemNotesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(purchaseItemId: string,  noteDto: CreatePurchaseItemNoteDto) {
    return this.prisma.purchaseItemNote.create({
      data: {
        purchaseItemId,
        text: noteDto.text,
        hour: new Date(), // You can modify this logic as needed
        date: new Date(),
        userId: noteDto.userId, // Pass the current user id
      },
    });
  }

 async findAll(purchaseItemId: string) {
    return this.prisma.purchaseItemNote.findMany({
      where: { purchaseItemId },
      include: {
        user: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.purchaseItemNote.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async update(id: string, updatePurchaseItemNoteDto: UpdatePurchaseItemNoteDto) {
    try {
      const updatedPurchaseItemNote = await this.prisma.purchaseItemNote.update({
        where: { id },
        data: updatePurchaseItemNoteDto,
      });
      return updatedPurchaseItemNote;
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint error code
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }
      throw new Error('An unexpected error occurred.');
    }
  }

  async remove(id: string) {
    try {
      const deletedPurchaseItemNote = await this.prisma.purchaseItemNote.delete({
        where: { id },
      });
      return deletedPurchaseItemNote;
    } catch (error) {
      if (error.code === 'P2025') { // Record not found error code
        throw new NotFoundException(`PurchaseItemNote with ID ${id} not found`);
      }
      throw new Error('An unexpected error occurred.');
    }
  }
}
