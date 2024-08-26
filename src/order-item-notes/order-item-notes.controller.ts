import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrderItemNotesService } from './order-item-notes.service';
import { CreateOrderItemNoteDto } from './dto/create-order-item-note.dto';
import { UpdateOrderItemNoteDto } from './dto/update-order-item-note.dto';

@Controller('order-item-notes')
export class OrderItemNotesController {
  constructor(private readonly orderItemNotesService: OrderItemNotesService) {}

  @Post('order-item/:orderItemId/note')
  async createOrderItemNote(
    @Param('orderItemId') orderItemId: string,
    @Body() createOrderItemNoteDto: CreateOrderItemNoteDto,
  ) {
    return this.orderItemNotesService.create(orderItemId, createOrderItemNoteDto);
  }

  @Get('order-items/:orderItemId')
  findAllByOrderItem(@Param('orderItemId') orderItemId: string) {
    return this.orderItemNotesService.findAllByOrderItem(orderItemId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderItemNotesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderItemNoteDto: UpdateOrderItemNoteDto) {
    return this.orderItemNotesService.update(id, updateOrderItemNoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderItemNotesService.remove(id);
  }
}
