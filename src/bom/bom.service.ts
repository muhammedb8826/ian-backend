import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ItemBom } from 'src/entities/item-bom.entity';
import { ItemBomLine } from 'src/entities/item-bom-line.entity';
import { Item } from 'src/entities/item.entity';
import { Pricing } from 'src/entities/pricing.entity';
import { CreateItemBomDto } from './dto/create-item-bom.dto';
import { UpdateItemBomDto } from './dto/update-item-bom.dto';
import { CreateOrderItemComponentDto } from 'src/order-items/dto/create-order-item-component.dto';

@Injectable()
export class BomService {
  constructor(
    @InjectRepository(ItemBom)
    private readonly itemBomRepository: Repository<ItemBom>,
    @InjectRepository(ItemBomLine)
    private readonly itemBomLineRepository: Repository<ItemBomLine>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Pricing)
    private readonly pricingRepository: Repository<Pricing>,
    private readonly dataSource: DataSource,
  ) {}

  private async resolveDefaultUnitCost(componentItemId: string): Promise<number> {
    const rows = await this.pricingRepository.find({
      where: { itemId: componentItemId },
      select: ['costPrice'],
    });
    if (!rows.length) {
      return 0;
    }
    return Math.min(...rows.map(r => Number(r.costPrice) || 0));
  }

  /**
   * Builds order line component rows from the active BOM for parentItemId × orderLineQuantity.
   * Empty array if no BOM.
   */
  async toOrderItemComponents(
    parentItemId: string,
    orderLineQuantity: number,
  ): Promise<CreateOrderItemComponentDto[]> {
    const qty = parseFloat((orderLineQuantity || 0).toString());
    if (qty <= 0) {
      return [];
    }

    const bom = await this.itemBomRepository
      .createQueryBuilder('bom')
      .leftJoinAndSelect('bom.lines', 'line')
      .where('bom.itemId = :itemId', { itemId: parentItemId })
      .andWhere('bom.isActive = :active', { active: true })
      .orderBy('line.sortOrder', 'ASC')
      .getOne();

    if (!bom?.lines?.length) {
      return [];
    }

    const out: CreateOrderItemComponentDto[] = [];
    for (const line of bom.lines) {
      const perUnit = parseFloat((line.quantityPerUnit || 0).toString());
      const lineQty = perUnit * qty;
      let unitCost = line.standardUnitCost != null ? parseFloat(line.standardUnitCost.toString()) : null;
      if (unitCost === null || Number.isNaN(unitCost)) {
        unitCost = await this.resolveDefaultUnitCost(line.componentItemId);
      }

      let selling: number | undefined;
      if (line.standardUnitSellingPrice != null) {
        selling = parseFloat(line.standardUnitSellingPrice.toString());
      }

      out.push({
        itemId: line.componentItemId,
        uomId: line.uomId,
        quantity: lineQty,
        unitCost: unitCost ?? 0,
        unitSellingPrice: selling,
        description: line.description || undefined,
      });
    }
    return out;
  }

  async findByItemId(itemId: string) {
    return this.itemBomRepository
      .createQueryBuilder('bom')
      .leftJoinAndSelect('bom.lines', 'line')
      .leftJoinAndSelect('line.componentItem', 'componentItem')
      .leftJoinAndSelect('line.uom', 'uom')
      .leftJoinAndSelect('bom.item', 'item')
      .where('bom.itemId = :itemId', { itemId })
      .orderBy('line.sortOrder', 'ASC')
      .getOne();
  }

  async findOne(id: string) {
    const bom = await this.itemBomRepository
      .createQueryBuilder('bom')
      .leftJoinAndSelect('bom.lines', 'line')
      .leftJoinAndSelect('line.componentItem', 'componentItem')
      .leftJoinAndSelect('line.uom', 'uom')
      .leftJoinAndSelect('bom.item', 'item')
      .where('bom.id = :id', { id })
      .orderBy('line.sortOrder', 'ASC')
      .getOne();
    if (!bom) {
      throw new NotFoundException('BOM not found');
    }
    return bom;
  }

  async create(dto: CreateItemBomDto) {
    const parentExists = await this.itemRepository.exist({ where: { id: dto.itemId } });
    if (!parentExists) {
      throw new NotFoundException(`Item ${dto.itemId} not found`);
    }
    const exists = await this.itemBomRepository.exist({ where: { itemId: dto.itemId } });
    if (exists) {
      throw new ConflictException(`A BOM already exists for item ${dto.itemId}. Use PATCH to update.`);
    }
    if (!dto.lines?.length) {
      throw new ConflictException('BOM must include at least one line');
    }

    await this.validateBomLines(dto.lines);

    const bom = this.itemBomRepository.create({
      itemId: dto.itemId,
      name: dto.name ?? null,
      isActive: dto.isActive !== false,
    });
    const saved = await this.itemBomRepository.save(bom);

    const lines = dto.lines.map((l, i) =>
      this.itemBomLineRepository.create({
        itemBomId: saved.id,
        sortOrder: l.sortOrder ?? i,
        componentItemId: l.componentItemId,
        uomId: l.uomId,
        quantityPerUnit: parseFloat((l.quantityPerUnit ?? 0).toString()),
        standardUnitCost: l.standardUnitCost != null ? parseFloat(l.standardUnitCost.toString()) : null,
        standardUnitSellingPrice:
          l.standardUnitSellingPrice != null ? parseFloat(l.standardUnitSellingPrice.toString()) : null,
        description: l.description ?? null,
      }),
    );
    await this.itemBomLineRepository.save(lines);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateItemBomDto) {
    const bom = await this.itemBomRepository.findOne({ where: { id } });
    if (!bom) {
      throw new NotFoundException('BOM not found');
    }

    await this.dataSource.transaction(async manager => {
      await manager.update(ItemBom, id, {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      });

      if (dto.lines !== undefined) {
        if (!dto.lines.length) {
          throw new ConflictException('BOM must include at least one line');
        }
        await this.validateBomLines(dto.lines);
        await manager.delete(ItemBomLine, { itemBomId: id });
        const lines = dto.lines.map((l, i) =>
          manager.getRepository(ItemBomLine).create({
            itemBomId: id,
            sortOrder: l.sortOrder ?? i,
            componentItemId: l.componentItemId,
            uomId: l.uomId,
            quantityPerUnit: parseFloat((l.quantityPerUnit ?? 0).toString()),
            standardUnitCost: l.standardUnitCost != null ? parseFloat(l.standardUnitCost.toString()) : null,
            standardUnitSellingPrice:
              l.standardUnitSellingPrice != null ? parseFloat(l.standardUnitSellingPrice.toString()) : null,
            description: l.description ?? null,
          }),
        );
        await manager.save(ItemBomLine, lines);
      }
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const bom = await this.itemBomRepository.findOne({ where: { id } });
    if (!bom) {
      throw new NotFoundException('BOM not found');
    }
    await this.itemBomRepository.remove(bom);
    return { message: 'BOM deleted' };
  }

  private async validateBomLines(
    lines: { componentItemId: string; uomId: string; quantityPerUnit: number }[],
  ) {
    for (const l of lines) {
      const okItem = await this.itemRepository.exist({ where: { id: l.componentItemId } });
      if (!okItem) {
        throw new NotFoundException(`Component item ${l.componentItemId} not found`);
      }
      const per = parseFloat((l.quantityPerUnit ?? 0).toString());
      if (per < 0) {
        throw new ConflictException('quantityPerUnit cannot be negative');
      }
    }
  }
}
