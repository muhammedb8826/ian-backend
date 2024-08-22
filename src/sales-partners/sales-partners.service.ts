import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSalesPartnerDto } from './dto/create-sales-partner.dto';
import { UpdateSalesPartnerDto } from './dto/update-sales-partner.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SalesPartnersService {
  constructor(private prisma: PrismaService){}
 async create(createSalesPartnerDto: CreateSalesPartnerDto) {
    const normalizedAttribute = createSalesPartnerDto.fullName.toLowerCase();
    const existingByName = this.prisma.salesPartners.findUnique({
      where: {
        fullName: normalizedAttribute
      }
    })

    if(existingByName) {
      throw new ConflictException('Sales Partner already exists')
    }
   
    const existingByEmail = this.prisma.salesPartners.findUnique({
      where: {
        email: createSalesPartnerDto.email
      }
    })

    if(existingByEmail) {
      throw new ConflictException('Sales Partner email already exists')
    }

    const existingByPhone = this.prisma.salesPartners.findUnique({
      where: {
        phone: createSalesPartnerDto.phone
      }
    })

    if(existingByPhone) {
      throw new ConflictException('Sales Partner phone already exists')
    }

    return this.prisma.salesPartners.create({
      data: {
        fullName: createSalesPartnerDto.fullName,
        address: createSalesPartnerDto.address,
        email: createSalesPartnerDto.email,
        phone: createSalesPartnerDto.phone,
        company: createSalesPartnerDto.company,
        description: createSalesPartnerDto.description
      }
    })

  }

  async findAll(skip: number, take: number) {
    const [salesPartners, total] =await this.prisma.$transaction([
      this.prisma.salesPartners.findMany({
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.salesPartners.count()
    ])

    return {
      salesPartners,
      total
    }
  }

  async findAllSalesPartners(search?: string) {  
    return this.prisma.salesPartners.findMany({
      where: search ? {
        OR: [
          {
            fullName: {
              contains: search
            }
          },
          {
            email: {
              contains: search
            }
          },
          {
            phone: {
              contains: search
            }
          },
          {
            company: {
              contains: search
            }
          }
        ],
      }
      : {},
      orderBy: {
        createdAt: 'desc'
      }
    })

  }

  findOne(id: string) {
   return this.prisma.salesPartners.findUnique({
      where: {id}
    });
  }

  update(id: string, updateSalesPartnerDto: UpdateSalesPartnerDto) {
    return this.prisma.salesPartners.update({
      where: {id},
      data: updateSalesPartnerDto
    })
  }

  remove(id: string) {
    return this.prisma.salesPartners.delete({
      where: {id}
    })
  }
}
