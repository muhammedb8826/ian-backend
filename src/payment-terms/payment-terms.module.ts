import { Module } from '@nestjs/common';
import { PaymentTermsService } from './payment-terms.service';
import { PaymentTermsController } from './payment-terms.controller';

@Module({
  controllers: [PaymentTermsController],
  providers: [PaymentTermsService],
})
export class PaymentTermsModule {}
