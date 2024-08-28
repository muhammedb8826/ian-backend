import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Post()
  async create(@Body() createOrderItemDto: CreateOrderItemDto) {
    return this.orderItemsService.create(createOrderItemDto);
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
