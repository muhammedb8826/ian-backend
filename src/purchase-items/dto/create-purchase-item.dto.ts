import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreatePurchaseItemNoteDto } from "src/purchase-item-notes/dto/create-purchase-item-note.dto";

export class CreatePurchaseItemDto {
    id: string;
    @IsNotEmpty()
    @IsString()
    itemId: string;

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

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseItemNoteDto)
    notes: CreatePurchaseItemNoteDto[];
}
