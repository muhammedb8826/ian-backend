import { Module } from '@nestjs/common';
import { OrderItemNotesService } from './order-item-notes.service';
import { OrderItemNotesController } from './order-item-notes.controller';

@Module({
  controllers: [OrderItemNotesController],
  providers: [OrderItemNotesService],
})
export class OrderItemNotesModule {}
