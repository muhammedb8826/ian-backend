import { IsNotEmpty, IsString } from "class-validator";

export class CreatePurchaseItemNoteDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  userId: string;
}
