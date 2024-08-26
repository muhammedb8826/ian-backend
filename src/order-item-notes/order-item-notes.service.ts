import { Injectable } from '@nestjs/common';
import { CreateOrderItemNoteDto } from './dto/create-order-item-note.dto';
import { UpdateOrderItemNoteDto } from './dto/update-order-item-note.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderItemNotesService {
  constructor(private prisma: PrismaService) {}
  async create(orderItemId: string, noteDto: CreateOrderItemNoteDto) {
    return this.prisma.orderItemNotes.create({
      data: {
        orderItemId,
        text: noteDto.text,
        hour: new Date(), // You can modify this logic as needed
        date: new Date(),
        userId: noteDto.userId, // Pass the current user id
      },
    });
  }

  async findAllByOrderItem(orderItemId: string) {
    return this.prisma.orderItemNotes.findMany({
      where: { orderItemId },
    });
  }


   async findOne(id: string) {
    return this.prisma.orderItemNotes.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateOrderItemNoteDto: UpdateOrderItemNoteDto) {
    return this.prisma.orderItemNotes.update({
      where: { id },
      data: updateOrderItemNoteDto,
    });
  }

  async remove(id: string) {
    return this.prisma.orderItemNotes.delete({
      where: { id },
    });
  }
}
