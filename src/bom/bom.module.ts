import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemBom } from 'src/entities/item-bom.entity';
import { ItemBomLine } from 'src/entities/item-bom-line.entity';
import { Item } from 'src/entities/item.entity';
import { Pricing } from 'src/entities/pricing.entity';
import { BomService } from './bom.service';
import { BomController } from './bom.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ItemBom, ItemBomLine, Item, Pricing])],
  controllers: [BomController],
  providers: [BomService],
  exports: [BomService],
})
export class BomModule {}
