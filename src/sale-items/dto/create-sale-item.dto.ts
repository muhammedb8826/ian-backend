import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateSaleItemNoteDto } from "src/sale-item-notes/dto/create-sale-item-note.dto";

export class CreateSaleItemDto {
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
    @Type(() =>CreateSaleItemNoteDto)
    notes: CreateSaleItemNoteDto[];

}
