import { IsOptional } from "class-validator";

export class CreateOrderItemDto {
    id: string;
    orderId: string;
    itemId: string;
    serviceId: string;
    width?: number;
    height?: number;

    @IsOptional()
    discount?: number;

    
    level: number;
    totalAmount: number;
    adminApproval: boolean;
    uomId: string;
    quantity: number;
    unitPrice: number;
    description?: string;
    isDiscounted: boolean;
    status: string;
}
