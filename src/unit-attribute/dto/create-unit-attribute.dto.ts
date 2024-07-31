import { IsNotEmpty, IsString } from "class-validator";

export class CreateUnitAttributeDto {
    id: string;
    @IsNotEmpty()
    @IsString()
    width: number;

    @IsNotEmpty()
    @IsString()
    height: number;

    @IsNotEmpty()
    @IsString()
    uomId: string;
}
