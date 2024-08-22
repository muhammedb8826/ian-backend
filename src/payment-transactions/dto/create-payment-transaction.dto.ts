export class CreatePaymentTransactionDto {
    id: string
    date: Date
    orderId: string
    paymentTermId: string
    paymentMethod: string
    reference: string
    amount: number
    status: string
    description?: string
}
