import { IsArray, IsNumber, IsString } from "class-validator";

export class CreatePricingDto {
    @IsString()
    itemId: string;

    @IsString()
    @IsArray({ each: true })
    serviceId: string;

    @IsNumber()
    sellingPrice: number;
}
