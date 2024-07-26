import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UnitAttributeService } from './unit-attribute.service';
import { CreateUnitAttributeDto } from './dto/create-unit-attribute.dto';
import { UpdateUnitAttributeDto } from './dto/update-unit-attribute.dto';

@Controller('unit-attribute')
export class UnitAttributeController {
  constructor(private readonly unitAttributeService: UnitAttributeService) {}

  @Post()
  create(@Body() createUnitAttributeDto: CreateUnitAttributeDto) {
    return this.unitAttributeService.create(createUnitAttributeDto);
  }

  @Get()
  findAll(@Query('page') page:number = 1, @Query('limit') limit: number = 10) {
    const skip = (page - 1) * limit
    const take = limit
    return this.unitAttributeService.findAll(skip, take);
  }

  @Get('all')
  findAllUnitAttributes() {
    return this.unitAttributeService.findAllUnitAttributes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitAttributeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUnitAttributeDto: UpdateUnitAttributeDto) {
    return this.unitAttributeService.update(id, updateUnitAttributeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unitAttributeService.remove(id);
  }
}
