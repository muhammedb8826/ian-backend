import { CreateItemBomLineDto } from './create-item-bom.dto';

export class UpdateItemBomDto {
  name?: string;
  isActive?: boolean;
  lines?: CreateItemBomLineDto[];
}
