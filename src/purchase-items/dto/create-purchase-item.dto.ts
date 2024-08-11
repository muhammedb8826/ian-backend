import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePurchaseItemDto {
    @IsNotEmpty()
    @IsString()
    itemId: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    unitPrice: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;
}
