import { Module } from '@nestjs/common';
import { SaleItemsService } from './sale-items.service';
import { SaleItemsController } from './sale-items.controller';

@Module({
  controllers: [SaleItemsController],
  providers: [SaleItemsService],
})
export class SaleItemsModule {}
