import { IsOptional, IsString } from 'class-validator';

export class CompanyProfitReportQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  items?: string | string[];
}
