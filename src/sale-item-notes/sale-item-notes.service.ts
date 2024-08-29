import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleItemNoteDto } from './dto/create-sale-item-note.dto';
import { UpdateSaleItemNoteDto } from './dto/update-sale-item-note.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SaleItemNotesService {
  constructor(private readonly prisma: PrismaService) {}
 async create(saleItemId: string, noteDto: CreateSaleItemNoteDto) {

    if (!noteDto || !noteDto.text || !noteDto.userId) {
      throw new Error('Invalid note data');
    }

    return this.prisma.salesItemNote.create({
      data: {
        saleItemId,
        text: noteDto.text,
        hour: new Date(), // You can modify this logic as needed
        date: new Date(),
        userId: noteDto.userId, // Pass the current user id
      },
    });
  }

 async findAll(saleItemId) {
    return this.prisma.salesItemNote.findMany({
     where: { saleItemId },
      include: {
        user: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.salesItemNote.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

 async update(id: string, updateSaleItemNoteDto: UpdateSaleItemNoteDto) {
    try {
      const updatedSaleItemNote = await this.prisma.salesItemNote.update({
        where: { id },
        data: updateSaleItemNoteDto,
      });
      return updatedSaleItemNote;
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint error code
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }
      throw new Error('An unexpected error occurred.');
    }
  }

  remove(id: string) {
    try {
      const deletedSaleItemNote = this.prisma.salesItemNote.delete({
        where: { id },
      });
      return deletedSaleItemNote;
    } catch (error) {
      if (error.code === 'P2025') { // Record not found error code
        throw new NotFoundException(`PurchaseItemNote with ID ${id} not found`);
      }
      throw new Error('An unexpected error occurred.');
    }
  }
}
