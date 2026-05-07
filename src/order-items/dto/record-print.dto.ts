import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';

export class RecordPrintDto {
  /**
   * - ALL: print everything remaining (equivalent to "print all")
   * - COMPLETED: print only what production already completed but is still unprinted (equivalent to "print completed")
   * - CUSTOM: print an explicit quantity
   */
  @IsIn(['ALL', 'COMPLETED', 'CUSTOM'])
  mode: 'ALL' | 'COMPLETED' | 'CUSTOM';

  /** Required only when mode = CUSTOM */
  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  quantity?: number;
}

