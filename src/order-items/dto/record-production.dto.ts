import { IsNumber, Min } from 'class-validator';

export class RecordProductionDto {
  @IsNumber()
  @Min(0.000001)
  additionalQuantity: number;
}
