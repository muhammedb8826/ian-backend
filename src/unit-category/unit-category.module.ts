import { Module } from '@nestjs/common';
import { UnitCategoryService } from './unit-category.service';
import { UnitCategoryController } from './unit-category.controller';

@Module({
  controllers: [UnitCategoryController],
  providers: [UnitCategoryService],
})
export class UnitCategoryModule {}
