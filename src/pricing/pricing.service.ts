import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) { }
  async create(createPricingDto: CreatePricingDto) {
    const { itemId, serviceId } = createPricingDto;

    const existing = this.prisma.pricing.findUnique({
      where: { itemId_serviceId: { itemId, serviceId } }
    });

    if (existing) {
      throw new ConflictException('Pricing already exists');
    }

    return this.prisma.pricing.create({
      data: createPricingDto
    });
  }

  async findAll(skip: number, take: number) {
    const [pricings, total] = await this.prisma.$transaction([
      this.prisma.pricing.findMany({
        skip: +skip,
        take: +take,
        orderBy: { createdAt: 'desc' },
        include: { item: true, service: true }
      }),
      this.prisma.pricing.count()
    ]);
    return { pricings, total };
  }


  async findAllPricing() {
    return this.prisma.pricing.findMany({
      include: { item: true, service: true }
    });
  }

  async findOne(id: string) {
    const pricing = await this.prisma.pricing.findUnique({
      where: { id },
      include: { item: true, service: true }
    });

    if (!pricing) {
      throw new ConflictException('Pricing not found');
    }

    return pricing;
  }

  async update(id: string, updatePricingDto: UpdatePricingDto) {
 
   const existing = this.prisma.pricing.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new ConflictException('Pricing not found');
    }

    return this.prisma.pricing.update({
      where: { id },
      data: updatePricingDto
    });
  }

  async remove(id: string) {
    const existing = this.prisma.pricing.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new ConflictException('Pricing not found');
    }

    return this.prisma.pricing.delete({
      where: { id }
    });
  }
}
