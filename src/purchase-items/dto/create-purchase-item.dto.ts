import { IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class CreatePurchaseItemDto {
    id: string;
    itemId: string;

    purchaseId: string;

    unitId: string;

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

    purchaseItemNotes : string[];
}
