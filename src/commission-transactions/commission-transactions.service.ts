import { Injectable } from '@nestjs/common';
import { CreateCommissionTransactionDto } from './dto/create-commission-transaction.dto';
import { UpdateCommissionTransactionDto } from './dto/update-commission-transaction.dto';

@Injectable()
export class CommissionTransactionsService {
  create(createCommissionTransactionDto: CreateCommissionTransactionDto) {
    return 'This action adds a new commissionTransaction';
  }

  findAll() {
    return `This action returns all commissionTransactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commissionTransaction`;
  }

  update(id: number, updateCommissionTransactionDto: UpdateCommissionTransactionDto) {
    return `This action updates a #${id} commissionTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} commissionTransaction`;
  }
}
