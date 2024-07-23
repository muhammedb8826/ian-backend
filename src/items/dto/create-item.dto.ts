import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateItemDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsInt()
    reorder_level: number;

    @IsInt()
    initial_stock: number;

    @IsInt()
    updated_initial_stock: number;

    @IsString()
    machineId: string;
}
