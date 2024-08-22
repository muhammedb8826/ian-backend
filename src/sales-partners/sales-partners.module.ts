import { Module } from '@nestjs/common';
import { SalesPartnersService } from './sales-partners.service';
import { SalesPartnersController } from './sales-partners.controller';

@Module({
  controllers: [SalesPartnersController],
  providers: [SalesPartnersService],
})
export class SalesPartnersModule {}
