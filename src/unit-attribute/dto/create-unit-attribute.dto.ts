import { IsNotEmpty, IsString } from "class-validator";

export class CreateUnitAttributeDto {
  @IsString()
  itemId: string;

  @IsString()
  unitId: string;

  @IsString()
  value: string;

  @IsString()
  @IsNotEmpty()
  attribute: string;

  @IsString()
  attribute_value: string;
}
