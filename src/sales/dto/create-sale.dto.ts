import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { CreateSaleItemDto } from "src/sale-items/dto/create-sale-item.dto";

export class CreateSaleDto {
    id: string;
    @IsString()
    @IsNotEmpty()
    series: string;

    @IsString()
    @IsNotEmpty()
    operatorId: string;

    @IsString()
    @IsNotEmpty()
    status: string;

    orderDate: Date;

    @IsOptional()
    paymentMethod?: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsOptional()
    @IsString()
    reference?: string;

    totalAmount: number;
    totalQuantity: number;
    note: string;

    saleItems: CreateSaleItemDto[];

}
