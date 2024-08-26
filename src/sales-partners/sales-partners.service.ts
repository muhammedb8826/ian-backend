import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSalesPartnerDto } from './dto/create-sales-partner.dto';
import { UpdateSalesPartnerDto } from './dto/update-sales-partner.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SalesPartnersService {
  constructor(private prisma: PrismaService) { }
  async create(createSalesPartnerDto: CreateSalesPartnerDto) {

    const existingCustomerByPhone = await this.prisma.salesPartners.findUnique({
      where: {
        phone: createSalesPartnerDto.phone
      }
    })

    if (existingCustomerByPhone) {
      throw new ConflictException('Sales Partner with this phone number already exists')
    }

    if (createSalesPartnerDto.email) {
      const existingCustomerByEmail = await this.prisma.salesPartners.findUnique({
        where: {
          email: createSalesPartnerDto.email
        }
      })

      if (existingCustomerByEmail) {
        throw new ConflictException('Sales Partner with this email already exists')
      }
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
    const [salesPartners, total] = await this.prisma.$transaction([
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

  async findOne(id: string) {
    return this.prisma.salesPartners.findUnique({
      where: { id }
    });
  }

  async update(id: string, updateSalesPartnerDto: UpdateSalesPartnerDto) {

    const currentSalesPartner = await this.prisma.salesPartners.findUnique({
      where: { id },
    });

    if (!currentSalesPartner) {
      throw new ConflictException('Sales Partner not found')
    }

    if (updateSalesPartnerDto.email && updateSalesPartnerDto.email !== currentSalesPartner.email) {
      const existingPartnerWithEmail = await this.prisma.salesPartners.findUnique({
        where: { email: updateSalesPartnerDto.email },
      });
  
      if (existingPartnerWithEmail) {
        throw new ConflictException('Email already in use by another sales partner');
      }
    }

    if (updateSalesPartnerDto.phone && updateSalesPartnerDto.phone !== currentSalesPartner.phone) {
      const existingPartnerWithPhone = await this.prisma.salesPartners.findUnique({
        where: { phone: updateSalesPartnerDto.phone },
      });
  
      if (existingPartnerWithPhone) {
        throw new ConflictException('Phone number already in use by another sales partner');
      }
    }

    return this.prisma.salesPartners.update({
      where: { id },
      data: updateSalesPartnerDto
    })
  }

  async remove(id: string) {
    return this.prisma.salesPartners.delete({
      where: { id }
    })
  }
}
