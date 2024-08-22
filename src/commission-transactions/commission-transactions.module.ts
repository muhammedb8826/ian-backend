import { Module } from '@nestjs/common';
import { CommissionTransactionsService } from './commission-transactions.service';
import { CommissionTransactionsController } from './commission-transactions.controller';

@Module({
  controllers: [CommissionTransactionsController],
  providers: [CommissionTransactionsService],
})
export class CommissionTransactionsModule {}
