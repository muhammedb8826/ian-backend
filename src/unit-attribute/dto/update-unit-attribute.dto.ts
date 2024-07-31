import { PartialType } from '@nestjs/mapped-types';
import { CreateUnitAttributeDto } from './create-unit-attribute.dto';

export class UpdateUnitAttributeDto extends PartialType(CreateUnitAttributeDto) {}
