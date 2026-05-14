import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { Pricing } from 'src/entities/pricing.entity';
import { ItemBom } from 'src/entities/item-bom.entity';
import { Item } from 'src/entities/item.entity';

export type StandardCostLineSource = 'bom_line_standard' | 'pricing' | 'purchase_price';

export type StandardCostPreviewLine = {
  componentItemId: string;
  quantityPerUnit: number;
  width?: number | null;
  height?: number | null;
  unitCostSource: StandardCostLineSource;
  unitCost: number;
  extendedCost: number;
};

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Pricing)
    private readonly pricingRepository: Repository<Pricing>,
    @InjectRepository(ItemBom)
    private readonly itemBomRepository: Repository<ItemBom>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(createPricingDto: CreatePricingDto) {
    const { itemId, serviceId, nonStockServiceId, isNonStockService } = createPricingDto;

    // Auto-correct the isNonStockService flag based on which ID is provided
    let correctedIsNonStockService = isNonStockService;
    if (nonStockServiceId && !serviceId) {
      correctedIsNonStockService = true;
    } else if (serviceId && !nonStockServiceId) {
      correctedIsNonStockService = false;
    }

    // Check for existing pricing based on service type
    let existing;
    if (correctedIsNonStockService && nonStockServiceId) {
      existing = await this.pricingRepository.findOne({
        where: { itemId, nonStockServiceId, isNonStockService: true }
      });
    } else if (serviceId) {
      existing = await this.pricingRepository.findOne({
        where: { itemId, serviceId, isNonStockService: false }
      });
    }

    if (existing) {
      throw new ConflictException('Pricing already exists for this item and service');
    }

    // Create pricing with corrected flag
    const pricingData = {
      ...createPricingDto,
      isNonStockService: correctedIsNonStockService
    };

    const pricing = this.pricingRepository.create(pricingData);
    return await this.pricingRepository.save(pricing);
  }

  async findAll(skip: number, take: number) {
    const [pricings, total] = await this.pricingRepository.findAndCount({
      skip: +skip,
      take: +take,
      order: { createdAt: 'DESC' },
      relations: ['item', 'service', 'nonStockService']
    });
    
    return { pricings, total };
  }

  async findAllPricing() {
    return this.pricingRepository.find({
      relations: ['item', 'service', 'nonStockService']
    });
  }

  /**
   * Read-only single-level standard BOM cost roll-up for parent catalog item pricing UI.
   * @see docs/PRICING_STANDARD_COST_PREVIEW.md
   */
  async standardCostPreview(itemId: string, serviceId: string, nonStockService: boolean) {
    const methodology = 'single_level_standard_bom_rollup';
    const currency = 'ETB';

    const bom = await this.itemBomRepository
      .createQueryBuilder('bom')
      .leftJoinAndSelect('bom.lines', 'line')
      .where('bom.itemId = :itemId', { itemId })
      .andWhere('bom.isActive = :active', { active: true })
      .orderBy('line.sortOrder', 'ASC')
      .getOne();

    if (!bom?.lines?.length) {
      return {
        methodology,
        suggestedCostPrice: null,
        currency,
        bomId: null,
        lines: [] as StandardCostPreviewLine[],
        warnings: ['No active BOM or no lines for this item'],
      };
    }

    const componentIds = [...new Set(bom.lines.map(l => l.componentItemId))];
    const nestedBoms =
      componentIds.length > 0
        ? await this.itemBomRepository.find({
            where: { itemId: In(componentIds), isActive: true },
            select: ['itemId'],
          })
        : [];
    const nestedItemIds = new Set(nestedBoms.map(b => b.itemId));

    const warnings: string[] = [];
    const lines: StandardCostPreviewLine[] = [];
    let sum = 0;

    for (const line of bom.lines) {
      if (nestedItemIds.has(line.componentItemId)) {
        warnings.push(
          `Component ${line.componentItemId} has its own active BOM; rollup is single-level only (nested explosion not applied).`,
        );
      }

      const quantityPerUnit = parseFloat(String(line.quantityPerUnit ?? 0));
      const w = line.width != null ? parseFloat(String(line.width)) : null;
      const h = line.height != null ? parseFloat(String(line.height)) : null;
      const hasArea = w != null && h != null && Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0;

      const { unitCost, source } = await this.resolveBomLineUnitCost(
        line.componentItemId,
        line.standardUnitCost,
        serviceId,
        nonStockService,
      );

      const extendedCost = hasArea ? quantityPerUnit * w * h * unitCost : quantityPerUnit * unitCost;
      sum += extendedCost;

      if (source === 'purchase_price' && unitCost === 0) {
        warnings.push(
          `Component ${line.componentItemId}: used purchase_price fallback 0 (set BOM standard, component pricing for this service, or items.purchase_price).`,
        );
      }

      lines.push({
        componentItemId: line.componentItemId,
        quantityPerUnit,
        width: hasArea ? w : null,
        height: hasArea ? h : null,
        unitCostSource: source,
        unitCost: this.roundMoney(unitCost, 6),
        extendedCost: this.roundMoney(extendedCost, 6),
      });
    }

    return {
      methodology,
      suggestedCostPrice: this.roundMoney(sum, 2),
      currency,
      bomId: bom.id,
      lines,
      warnings: [...new Set(warnings)],
    };
  }

  private roundMoney(value: number, decimals: number): number {
    const f = 10 ** decimals;
    return Math.round((Number.isFinite(value) ? value : 0) * f) / f;
  }

  private async resolveBomLineUnitCost(
    componentItemId: string,
    standardUnitCost: number | null | undefined,
    serviceId: string,
    nonStockService: boolean,
  ): Promise<{ unitCost: number; source: StandardCostLineSource }> {
    if (standardUnitCost != null && !Number.isNaN(parseFloat(String(standardUnitCost)))) {
      return { unitCost: parseFloat(String(standardUnitCost)), source: 'bom_line_standard' };
    }

    const pricingRows = nonStockService
      ? await this.pricingRepository.find({
          where: { itemId: componentItemId, nonStockServiceId: serviceId, isNonStockService: true },
          select: ['costPrice'],
        })
      : await this.pricingRepository.find({
          where: { itemId: componentItemId, serviceId, isNonStockService: false },
          select: ['costPrice'],
        });

    const costs = pricingRows
      .map(r => parseFloat(String(r.costPrice)))
      .filter(n => Number.isFinite(n) && n >= 0);
    if (costs.length > 0) {
      return { unitCost: Math.min(...costs), source: 'pricing' };
    }

    const item = await this.itemRepository.findOne({
      where: { id: componentItemId },
      select: ['id', 'purchase_price'],
    });
    const pp = item?.purchase_price != null ? parseFloat(String(item.purchase_price)) : 0;
    const unitCost = !Number.isNaN(pp) && pp >= 0 ? pp : 0;
    return { unitCost, source: 'purchase_price' };
  }

  async findOne(id: string) {
    const pricing = await this.pricingRepository.findOne({
      where: { id },
      relations: ['item', 'service', 'nonStockService']
    });

    if (!pricing) {
      throw new NotFoundException('Pricing not found');
    }

    return pricing;
  }

  async update(id: string, updatePricingDto: UpdatePricingDto) {
    const existing = await this.pricingRepository.findOne({
      where: { id }
    });

    if (!existing) {
      throw new NotFoundException('Pricing not found');
    }

    // Auto-correct the isNonStockService flag based on which ID is provided
    const { serviceId, nonStockServiceId, isNonStockService } = updatePricingDto;
    let correctedIsNonStockService = isNonStockService;
    
    if (nonStockServiceId && !serviceId) {
      correctedIsNonStockService = true;
    } else if (serviceId && !nonStockServiceId) {
      correctedIsNonStockService = false;
    }

    // Update with corrected flag
    const updateData = {
      ...updatePricingDto,
      isNonStockService: correctedIsNonStockService
    };

    await this.pricingRepository.update(id, updateData);
    
    return await this.pricingRepository.findOne({
      where: { id },
      relations: ['item', 'service', 'nonStockService']
    });
  }

  async remove(id: string) {
    const existing = await this.pricingRepository.findOne({
      where: { id }
    });

    if (!existing) {
      throw new NotFoundException('Pricing not found');
    }

    await this.pricingRepository.remove(existing);
    return { message: `Pricing with ID ${id} removed successfully` };
  }
}
