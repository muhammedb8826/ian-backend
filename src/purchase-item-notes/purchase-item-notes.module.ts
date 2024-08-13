import { Module } from '@nestjs/common';
import { PurchaseItemNotesService } from './purchase-item-notes.service';
import { PurchaseItemNotesController } from './purchase-item-notes.controller';

@Module({
  controllers: [PurchaseItemNotesController],
  providers: [PurchaseItemNotesService],
})
export class PurchaseItemNotesModule {}
