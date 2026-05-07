import { IsOptional } from 'class-validator';

export class CreateOrderItemComponentDto {
  id?: string;
  orderItemId?: string;
  itemId: string;
  uomId: string;
  quantity: number;
  unitCost: number;

  @IsOptional()
  unitSellingPrice?: number;

  @IsOptional()
  totalCost?: number;

  @IsOptional()
  description?: string;

  @IsOptional()
  notes?: string;
}
