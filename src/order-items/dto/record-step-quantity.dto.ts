import { IsNumber, Min } from 'class-validator';

export class RecordStepQuantityDto {
  @IsNumber()
  @Min(0.000001)
  additionalQuantity: number;
}

