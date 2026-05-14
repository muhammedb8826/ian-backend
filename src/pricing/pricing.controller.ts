import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { Public } from '../decorators/public.decorator';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post()
  create(@Body() createPricingDto: CreatePricingDto) {
    console.log(createPricingDto)
    return this.pricingService.create(createPricingDto);
  }

  @Public()
  @Get()
  findAll(@Query('page') page:number = 1, @Query('limit') limit: number = 10) {
    const skip = (page - 1) * limit
    const take = limit
    return this.pricingService.findAll(skip, take);
  }

  @Public()
  @Get('all')
  findAllPricing() {
    return this.pricingService.findAllPricing();
  }

  /**
   * Single-level BOM standard cost roll-up (read-only). Must stay above `GET :id` so `standard-cost-preview` is not parsed as an id.
   */
  @Public()
  @Get('standard-cost-preview')
  standardCostPreview(
    @Query('itemId', new ParseUUIDPipe()) itemId: string,
    @Query('serviceId', new ParseUUIDPipe()) serviceId: string,
    @Query('nonStockService') nonStockServiceRaw?: string,
  ) {
    const nonStockService =
      nonStockServiceRaw === 'true' ||
      nonStockServiceRaw === '1' ||
      String(nonStockServiceRaw).toLowerCase() === 'yes';
    return this.pricingService.standardCostPreview(itemId, serviceId, nonStockService);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pricingService.findOne(id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePricingDto: UpdatePricingDto) {
    return this.pricingService.update(id, updatePricingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pricingService.remove(id);
  }
}
