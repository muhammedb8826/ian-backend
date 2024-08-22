export class CreateOrderItemDto {
    id: string;
    orderId: string;
    itemId: string;
    serviceId: string;
    width?: number;
    height?: number;
    discount?: number;
    level: number;
    totalAmount: number;
    adminApproval: boolean;
    uomId: string;
    quantity: number;
    unitPrice: number;
    description?: string;
    status: string;
}
