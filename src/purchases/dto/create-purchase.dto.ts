import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreatePurchaseItemDto } from "src/purchase-items/dto/create-purchase-item.dto";

// class CreatePurchaseItemDto {
//     @IsString()
//     @IsNotEmpty()
//     itemId: string;
  
//     @IsNumber()
//     @IsNotEmpty()
//     quantity: number;

//     @IsNumber()
//     @IsNotEmpty()
//     unitPrice: number;

//     @IsOptional()
//     @IsString()
//     description?: string;

//     @IsOptional()
//     @IsString()
//     status?: string;
  
//     @IsNumber()
//     @IsNotEmpty()
//     amount: number;
//   }
export class CreatePurchaseDto {
    id: string;
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

    @IsNumber()
    @IsNotEmpty()
    totalAmount: number;

    @IsNumber()
    @IsNotEmpty()
    totalQuantity: number;

    @IsOptional()
    @IsString()
    note?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseItemDto)
    items: CreatePurchaseItemDto[];
}
