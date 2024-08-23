import { CreateCommissionTransactionDto } from "src/commission-transactions/dto/create-commission-transaction.dto"

export class CreateCommissionDto {
    id: string
    orderId: string
    salesPartnerId: string
    amount: number
    description?: string
    transactions?: CreateCommissionTransactionDto[];
}
