import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BomService } from './bom.service';
import { CreateItemBomDto } from './dto/create-item-bom.dto';
import { UpdateItemBomDto } from './dto/update-item-bom.dto';

@Controller('item-bom')
export class BomController {
  constructor(private readonly bomService: BomService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bomService.findAll({
      page: page != null ? parseInt(page, 10) : undefined,
      limit: limit != null ? parseInt(limit, 10) : undefined,
    });
  }

  @Post()
  create(@Body() dto: CreateItemBomDto) {
    return this.bomService.create(dto);
  }

  @Get('item/:itemId')
  findByItemId(@Param('itemId') itemId: string) {
    return this.bomService.findByItemId(itemId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bomService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateItemBomDto) {
    return this.bomService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bomService.remove(id);
  }
}
