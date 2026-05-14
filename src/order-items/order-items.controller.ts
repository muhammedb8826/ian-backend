import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { RecordProductionDto } from './dto/record-production.dto';
import { RecordPrintDto } from './dto/record-print.dto';
import { RecordStepQuantityDto } from './dto/record-step-quantity.dto';

@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Post()
  async create(@Body() createOrderItemDto: CreateOrderItemDto) {
    return this.orderItemsService.create(createOrderItemDto);
  }

  @Post(':id/record-production')
  async recordProduction(@Param('id') id: string, @Body() dto: RecordProductionDto) {
    return this.orderItemsService.recordProduction(id, dto);
  }

  @Post(':id/record-print')
  async recordPrint(@Param('id') id: string, @Body() dto: RecordPrintDto) {
    return this.orderItemsService.recordPrint(id, dto);
  }

  @Post(':id/record-quality-control')
  async recordQualityControl(@Param('id') id: string, @Body() dto: RecordStepQuantityDto) {
    return this.orderItemsService.recordQualityControl(id, dto);
  }

  @Post(':id/record-delivery')
  async recordDelivery(@Param('id') id: string, @Body() dto: RecordStepQuantityDto) {
    return this.orderItemsService.recordDelivery(id, dto);
  }

  @Get('all')
  async findAllOrderItems(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('item') item?: string,
    @Query('status') status?: string,
  ) {
    const skip = (page - 1) * limit
    const take = limit
    return this.orderItemsService.findAllOrderItems(skip, take, search, startDate, endDate, item, status);
  }

  @Get(':orderId')
  async findAll(@Param('orderId') orderId: string) {
    return this.orderItemsService.findAll(orderId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrderItemDto: UpdateOrderItemDto) {
    return this.orderItemsService.update(id, updateOrderItemDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.orderItemsService.remove(id);
  }
}
