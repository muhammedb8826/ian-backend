import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOperatorStockDto } from './dto/create-operator-stock.dto';
import { UpdateOperatorStockDto } from './dto/update-operator-stock.dto';
import { OperatorStock } from 'src/entities/operator-stock.entity';


@Injectable()
export class OperatorStockService {
  constructor(
    @InjectRepository(OperatorStock)
    private readonly operatorStockRepository: Repository<OperatorStock>,
  ) {}

  async create(createOperatorStockDto: CreateOperatorStockDto) {
    // Create a new operator stock record
    const newOperatorStock = this.operatorStockRepository.create(createOperatorStockDto);
    return await this.operatorStockRepository.save(newOperatorStock);
  }

  async findAll(skip: number, take: number, search?: string) {
    const queryBuilder = this.operatorStockRepository
      .createQueryBuilder('operatorStock')
      .leftJoinAndSelect('operatorStock.item', 'item')
      .leftJoinAndSelect('operatorStock.uoms', 'uoms')
      .orderBy('operatorStock.createdAt', 'DESC')
      .skip(Number(skip))
      .take(Number(take));

    if (search) {
      queryBuilder.where('item.name LIKE :search', { search: `%${search}%` });
    }

    const [operatorStocks, total] = await queryBuilder.getManyAndCount();

    return { operatorStocks, total };
  }

  async findOne(id: string) {
    // Retrieve a single operator stock record by ID
    const operatorStock = await this.operatorStockRepository.findOne({
      where: { id },
      relations: ['item', 'uoms'],
    });

    if (!operatorStock) {
      throw new NotFoundException(`Operator Stock with ID ${id} not found`);
    }

    return operatorStock;
  }

  async update(id: string, updateOperatorStockDto: UpdateOperatorStockDto) {
    // Check if the operator stock record exists
    const operatorStock = await this.operatorStockRepository.findOne({
      where: { id },
    });

    if (!operatorStock) {
      throw new NotFoundException(`Operator Stock with ID ${id} not found`);
    }

    // Update the operator stock record
    await this.operatorStockRepository.update(id, updateOperatorStockDto);
    
    return await this.operatorStockRepository.findOne({
      where: { id },
      relations: ['item', 'uoms'],
    });
  }

  async remove(id: string) {
    // Check if the operator stock record exists
    const operatorStock = await this.operatorStockRepository.findOne({
      where: { id },
    });

    if (!operatorStock) {
      throw new NotFoundException(`Operator Stock with ID ${id} not found`);
    }

    // Delete the operator stock record
    await this.operatorStockRepository.remove(operatorStock);

    return { message: `Operator Stock with ID ${id} removed successfully` };
  }
}
