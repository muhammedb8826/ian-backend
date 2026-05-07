import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { FixedCost } from 'src/entities/fixed-cost.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, FixedCost])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
