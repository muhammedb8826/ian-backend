import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PurchaseItemNotesService } from './purchase-item-notes.service';
import { CreatePurchaseItemNoteDto } from './dto/create-purchase-item-note.dto';
import { UpdatePurchaseItemNoteDto } from './dto/update-purchase-item-note.dto';

@Controller('purchase-item-notes')
export class PurchaseItemNotesController {
  constructor(private readonly purchaseItemNotesService: PurchaseItemNotesService) {}

  @Post()
  create(@Body() createPurchaseItemNoteDto: CreatePurchaseItemNoteDto) {
    return this.purchaseItemNotesService.create(createPurchaseItemNoteDto);
  }

  @Get()
  findAll() {
    return this.purchaseItemNotesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseItemNotesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePurchaseItemNoteDto: UpdatePurchaseItemNoteDto) {
    return this.purchaseItemNotesService.update(id, updatePurchaseItemNoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseItemNotesService.remove(id);
  }
}
