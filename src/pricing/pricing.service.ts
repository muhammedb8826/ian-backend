import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { Pricing } from 'src/entities/pricing.entity';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Pricing)
    private readonly pricingRepository: Repository<Pricing>,
  ) {}

  async create(createPricingDto: CreatePricingDto) {
    const { itemId, serviceId } = createPricingDto;

    const existing = await this.pricingRepository.findOne({
      where: { itemId, serviceId }
    });

    if (existing) {
      throw new ConflictException('Pricing already exists');
    }

    const pricing = this.pricingRepository.create(createPricingDto);
    return await this.pricingRepository.save(pricing);
  }

  async findAll(skip: number, take: number) {
    const [pricings, total] = await this.pricingRepository.findAndCount({
      skip: +skip,
      take: +take,
      order: { createdAt: 'DESC' },
      relations: ['item', 'service']
    });
    
    return { pricings, total };
  }

  async findAllPricing() {
    return this.pricingRepository.find({
      relations: ['item', 'service']
    });
  }

  async findOne(id: string) {
    const pricing = await this.pricingRepository.findOne({
      where: { id },
      relations: ['item', 'service']
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

    await this.pricingRepository.update(id, updatePricingDto);
    
    return await this.pricingRepository.findOne({
      where: { id },
      relations: ['item', 'service']
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
