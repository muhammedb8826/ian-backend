import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

class CreateDiscountDto {
    id: string;
    level: number;
    @IsInt()
    quantity: number;
    percentage: number;
}


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

    @IsBoolean()
    can_be_sold: boolean;

    @IsBoolean()
    can_be_purchased: boolean;

    purchase_price: number;
    selling_price: number;

    @IsOptional()
    @IsString()
    unitOfMeasureId?: string;
   
    @IsOptional()
    @IsString()
    purchaseUnitOfMeasureId?: string;

    @IsString()
    machineId: string;

    quantity: number;
    discounts?: CreateDiscountDto[];

    unitCategoryId?: string;
}
