export class CreateItemBomLineDto {
  componentItemId: string;
  uomId: string;
  quantityPerUnit: number;
  /** Optional fixed dimensions of each consumed piece (e.g. 1.22m x 2.44m sheet). */
  width?: number;
  height?: number;
  /** When width & height are set, this is interpreted as cost per square unit. */
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
