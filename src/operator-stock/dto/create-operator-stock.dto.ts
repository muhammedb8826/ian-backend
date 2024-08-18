export class CreateOperatorStockDto {
    id: string;
    itemId: string;
    unitId: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    description?: string;
    status: string;
}
