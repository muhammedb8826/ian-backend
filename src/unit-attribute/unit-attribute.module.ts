import { Module } from '@nestjs/common';
import { UnitAttributeService } from './unit-attribute.service';
import { UnitAttributeController } from './unit-attribute.controller';

@Module({
  controllers: [UnitAttributeController],
  providers: [UnitAttributeService],
})
export class UnitAttributeModule {}
