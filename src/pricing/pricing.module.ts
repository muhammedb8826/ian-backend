import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { Pricing } from 'src/entities/pricing.entity';
import { ItemBom } from 'src/entities/item-bom.entity';
import { Item } from 'src/entities/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pricing, ItemBom, Item])],
  controllers: [PricingController],
  providers: [PricingService],
})

export class PricingModule {}