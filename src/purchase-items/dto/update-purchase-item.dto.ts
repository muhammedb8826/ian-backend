import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseItemDto } from './create-purchase-item.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePurchaseItemDto extends PartialType(CreatePurchaseItemDto) {
    @IsOptional()
    @IsString()
    id?: string;
  
    @IsOptional()
    @IsString()
    purchaseId?: string;
  
    @IsOptional()
    @IsString()
    itemId?: string;
  
    @IsOptional()
    @IsNumber()
    quantity?: number;
  
    @IsOptional()
    @IsNumber()
    unitPrice?: number;
  
    @IsOptional()
    @IsNumber()
    amount?: number;
  
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @IsString()
    status?: string;
  
    // Add other fields if necessary
  
    // Add the items field if it's part of the update operation
    @IsOptional()
    items?: {
      id?: string;
      itemId?: string;
      quantity?: number;
      unitPrice?: number;
      amount?: number;
      description?: string;
      status?: string;
    }[];

}
