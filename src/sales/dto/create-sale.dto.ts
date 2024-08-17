import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
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

    @IsNotEmpty()
    @Type(() => Date)
    orderDate: Date;

    @IsString()
    @IsNotEmpty()
    paymentMethod: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsOptional()
    @IsString()
    reference?: string;

    totalAmount: number;
    totalQuantity: number;
    note: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSaleItemDto)
    items: CreateSaleItemDto[];

}
