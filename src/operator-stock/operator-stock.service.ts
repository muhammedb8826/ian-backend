import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOperatorStockDto } from './dto/create-operator-stock.dto';
import { UpdateOperatorStockDto } from './dto/update-operator-stock.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OperatorStockService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOperatorStockDto: CreateOperatorStockDto) {
    // Create a new operator stock record
    const newOperatorStock = await this.prisma.operatorStock.create({
      data: createOperatorStockDto,
    });

    return newOperatorStock;
  }

  
  async findAll(skip: number, take: number, search?: string) {
    const [operatorStocks, total] = await this.prisma.$transaction([
      this.prisma.operatorStock.findMany({
        skip: Number(skip),
        take: Number(take),
        where: search
          ? {
              // Assuming search can match with item name
              item: {
                name: { contains: search, mode: 'insensitive' },
              },
            }
          : {},
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          item: true,  // Include item details, such as item name
        },
      }),
      this.prisma.operatorStock.count({
        where: search
          ? {
              item: {
                name: { contains: search, mode: 'insensitive' },
              },
            }
          : {},
      }),
    ]);
  
    return { operatorStocks, total };
  }

  async findOne(id: string) {
    // Retrieve a single operator stock record by ID
    const operatorStock = await this.prisma.operatorStock.findUnique({
      where: { id },
    });

    if (!operatorStock) {
      throw new NotFoundException(`Operator Stock with ID ${id} not found`);
    }

    return operatorStock;
  }

  async update(id: string, updateOperatorStockDto: UpdateOperatorStockDto) {
    // Check if the operator stock record exists
    const operatorStock = await this.prisma.operatorStock.findUnique({
      where: { id },
    });

    if (!operatorStock) {
      throw new NotFoundException(`Operator Stock with ID ${id} not found`);
    }

    // Update the operator stock record
    const updatedOperatorStock = await this.prisma.operatorStock.update({
      where: { id },
      data: updateOperatorStockDto,
    });

    return updatedOperatorStock;
  }

  async remove(id: string) {
    // Check if the operator stock record exists
    const operatorStock = await this.prisma.operatorStock.findUnique({
      where: { id },
    });

    if (!operatorStock) {
      throw new NotFoundException(`Operator Stock with ID ${id} not found`);
    }

    // Delete the operator stock record
    await this.prisma.operatorStock.delete({
      where: { id },
    });

    return { message: `Operator Stock with ID ${id} removed successfully` };
  }
}
