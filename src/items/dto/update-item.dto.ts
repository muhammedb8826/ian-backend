import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { IsInt } from 'class-validator';

export class UpdateItemDto extends PartialType(CreateItemDto) {
    @IsInt()
    reorder_level: number;

    @IsInt()
    initial_stock: number;

    @IsInt()
    updated_initial_stock: number;
}
