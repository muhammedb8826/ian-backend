import { IsNumber, IsString } from "class-validator";

export class CreatePricingDto {
    @IsString()
    itemId: string;

    @IsString()
    serviceId: string;

    @IsNumber()
    sellingPrice: number;

    constant: boolean;
    width? : number;
    height? : number;
    baseUomId: string;
}
