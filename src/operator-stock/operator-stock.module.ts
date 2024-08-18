import { Module } from '@nestjs/common';
import { OperatorStockService } from './operator-stock.service';
import { OperatorStockController } from './operator-stock.controller';

@Module({
  controllers: [OperatorStockController],
  providers: [OperatorStockService],
})
export class OperatorStockModule {}
