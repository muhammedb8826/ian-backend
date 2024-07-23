import { IsString } from "class-validator";

export class CreateUnitAttributeDto {
  @IsString()
  itemId: string;

  @IsString()
  unitId: string;

  @IsString()
  value: string;
}
