export class CreateCommissionTransactionDto {
    id: string
    orderId: string
    date: Date
    amount: number
    percentage: number
    commissionId: string
    paymentMethod: string
    reference: string
    status: string
    description?: string
}
