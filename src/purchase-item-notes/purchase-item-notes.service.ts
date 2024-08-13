import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePurchaseItemNoteDto } from './dto/create-purchase-item-note.dto';
import { UpdatePurchaseItemNoteDto } from './dto/update-purchase-item-note.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PurchaseItemNotesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createPurchaseItemNoteDto: CreatePurchaseItemNoteDto) {
    try {
      const purchaseItemNote = this.prisma.purchaseItemNote.create({
        data: createPurchaseItemNoteDto,
      });
      return purchaseItemNote;
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint error code
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

 async findAll() {
    return this.prisma.purchaseItemNote.findMany({
      include: { item: true, user: true },
    });
  }

  async findOne(id: string) {
    const purchaseItemNote = await this.prisma.purchaseItemNote.findUnique({
      where: { id },
      include: { item: true, user: true },
    });
    
    if (!purchaseItemNote) {
      throw new NotFoundException(`PurchaseItemNote with ID ${id} not found`);
    }
    
    return purchaseItemNote;
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
      throw new InternalServerErrorException('An unexpected error occurred.');
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
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }
}
