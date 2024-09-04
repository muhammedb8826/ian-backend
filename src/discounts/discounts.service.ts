import { ConflictException, Injectable } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) { }
 async create(createDiscountDto: CreateDiscountDto) {
    const { itemId, level } = createDiscountDto;

    const existing =await this.prisma.discounts.findUnique({
      where: { itemId_level: { itemId, level } }
    });

    if (existing) {
      throw new ConflictException('Discount already exists');
    }

    return this.prisma.discounts.create({
      data: createDiscountDto
    });
  }

  async findAll(skip: number, take: number) {
    const [discounts, total] =await this.prisma.$transaction([
      this.prisma.discounts.findMany({
        skip: +skip,
        take: +take,
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      }),
      this.prisma.discounts.count()
    ]);
    return { discounts, total };
  }

  async findAllDiscounts() {
    return await this.prisma.discounts.findMany({
      include: { items: true }
    });
  }

 async findOne(id: string) {
    const discount = await this.prisma.discounts.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!discount) {
      throw new ConflictException('Discount not found');
    }

    return discount;
  }

 async update(id: string, updateDiscountDto: UpdateDiscountDto) {
    const existing = await this.prisma.discounts.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new ConflictException('Discount not found');
    }

    return this.prisma.discounts.update({
      where: { id },
      data: updateDiscountDto
    });
  }

 async remove(id: string) {
    return await this.prisma.discounts.delete({
      where: { id }
    });
  }
}
