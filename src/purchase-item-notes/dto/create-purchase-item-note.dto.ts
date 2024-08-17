import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreatePurchaseItemNoteDto {
  @IsNotEmpty()
  @IsString()
  readonly text: string;

  @IsNotEmpty()
  @IsString()
  readonly itemId: string;

  @IsNotEmpty()
  @IsString()
  readonly userId: string;

  @IsNotEmpty()
  @IsDateString()
  readonly date: Date;

  @IsNotEmpty()
  @IsDateString()
  readonly hour: Date;
}
