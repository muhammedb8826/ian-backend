import { Injectable } from '@nestjs/common';
import { CreatePaymentTermDto } from './dto/create-payment-term.dto';
import { UpdatePaymentTermDto } from './dto/update-payment-term.dto';

@Injectable()
export class PaymentTermsService {
  create(createPaymentTermDto: CreatePaymentTermDto) {
    return 'This action adds a new paymentTerm';
  }

  findAll() {
    return `This action returns all paymentTerms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paymentTerm`;
  }

  update(id: number, updatePaymentTermDto: UpdatePaymentTermDto) {
    return `This action updates a #${id} paymentTerm`;
  }

  remove(id: number) {
    return `This action removes a #${id} paymentTerm`;
  }
}
