import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleItemNoteDto } from './dto/create-sale-item-note.dto';
import { UpdateSaleItemNoteDto } from './dto/update-sale-item-note.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SaleItemNotesService {
  constructor(private readonly prisma: PrismaService) {}
 async create(createSaleItemNoteDto: CreateSaleItemNoteDto) {
    try {
      const saleItemNote = this.prisma.salesItemNote.create({
        data: createSaleItemNoteDto,
      });
      return saleItemNote;
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint error code
        throw new ConflictException('Unique constraint failed. Please check your data.');
      }
      throw new error('An unexpected error occurred.');
    }
  }

 async findAll() {
    return this.prisma.salesItemNote.findMany({
      include: { item: true, user: true },
    });
  }

  async findOne(id: string) {
   const saleItemNote = await this.prisma.salesItemNote.findUnique({
      where: { id },
      include: { item: true, user: true },
    });
    
    if (!saleItemNote) {
      throw new NotFoundException(`SaleItemNote with ID ${id} not found`);
    }
    
    return saleItemNote;
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
      throw new error('An unexpected error occurred.');
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
      throw new error('An unexpected error occurred.');
    }
  }
}
