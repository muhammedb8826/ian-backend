import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CompanyProfitReportQueryDto } from './dto/company-profit-report-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('company-profit')
  getCompanyProfitReport(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query() query: CompanyProfitReportQueryDto,
  ): Promise<unknown> {
    return this.reportsService.getCompanyProfitReport({
      ...query,
      page,
      limit,
    });
  }
}
