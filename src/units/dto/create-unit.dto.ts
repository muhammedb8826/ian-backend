import { IsNotEmpty, IsString } from "class-validator";

export class CreateUnitDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    data_type: string;
}
