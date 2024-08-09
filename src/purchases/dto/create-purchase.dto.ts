import { Type } from "class-transformer";
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

class CreatePurchaseItemDto {
     id: string;

    @IsString()
    itemId: string;
  
    @IsNumber()
    quantity: number;

    purchaseId: string;

    unitPrice: number;

    description?: string;

    status?: string;
  
    @IsNumber()
    amount: number;
  }
export class CreatePurchaseDto {
    @IsString()
    @IsNotEmpty()
    series: string;


    @IsString()
    @IsNotEmpty()
    vendorId: string;

    @IsString()
    @IsNotEmpty()
    purchaseRepresentativeId: string;

    @IsString()
    @IsNotEmpty()
    status: string;

    @IsDate()
    orderDate: Date;

    @IsString()
    @IsNotEmpty()
    paymentMethod: string;

    @IsNumber()
    amount: number;

    @IsString()
    @IsOptional()
    reference?: string;

    @IsNumber()
    totalAmount: number;

    @IsNumber()
    totalQuantity: number;

    @IsString()
    @IsOptional()
    note?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseItemDto)
    items: CreatePurchaseItemDto[];
}
