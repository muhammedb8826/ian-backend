export class CreateItemBomLineDto {
  componentItemId: string;
  uomId: string;
  quantityPerUnit: number;
  standardUnitCost?: number;
  standardUnitSellingPrice?: number;
  description?: string;
  sortOrder?: number;
}

export class CreateItemBomDto {
  itemId: string;
  name?: string;
  isActive?: boolean;
  lines: CreateItemBomLineDto[];
}
