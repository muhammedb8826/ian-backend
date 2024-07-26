import { ConflictException, Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { services } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService){}
  async create(createServiceDto: CreateServiceDto): Promise<services> {
    const normalizedAttribute = createServiceDto.name.toLowerCase();
    const existingByName = await this.prisma.services.findUnique({
      where: {
        name: normalizedAttribute
      }
    })

    if(existingByName) {
      throw new ConflictException('Service already exists')
    }

    return await this.prisma.services.create({
      data: {
        name: createServiceDto.name,
        description: createServiceDto.description,
        status: createServiceDto.status
      }
    })
  }

  async findAll(skip: number, take: number) {
    const [services, total] = await this.prisma.$transaction([
      this.prisma.services.findMany({
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.services.count()
    ])
    return {
      services,
      total
    }
  }

  findOne(id: string) {
    return this.prisma.services.findUnique({
      where: {id}
    });
  }

  update(id: string, updateServiceDto: UpdateServiceDto) {
    return this.prisma.services.update({
      where: {id},
      data: updateServiceDto
    })
  }

  remove(id: string) {
    return this.prisma.services.delete({
      where: {id}
    })
  }
}
