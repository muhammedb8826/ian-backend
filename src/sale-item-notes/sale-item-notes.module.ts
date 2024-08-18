import { Module } from '@nestjs/common';
import { SaleItemNotesService } from './sale-item-notes.service';
import { SaleItemNotesController } from './sale-item-notes.controller';

@Module({
  controllers: [SaleItemNotesController],
  providers: [SaleItemNotesService],
})
export class SaleItemNotesModule {}
