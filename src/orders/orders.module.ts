import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from 'src/entities/order.entity';
import { Pricing } from 'src/entities/pricing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Pricing])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
