import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateUnitAttributeDto {
  @IsString()
  itemId: string;

  @IsString()
  unitId: string;

  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  attribute: string;

  @IsString()
  attribute_value: string;
}
