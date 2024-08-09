import { ConflictException, Injectable } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService){}
 async create(createVendorDto: CreateVendorDto) {
    const normalizedAttribute = createVendorDto.fullName.toLowerCase();
    const existingByName = await this.prisma.vendors.findUnique({
      where: {
        fullName: normalizedAttribute
      }
    })

    if(existingByName) {
      throw new ConflictException('Vendor already exists')
    }

    const existingByEmail = await this.prisma.vendors.findUnique({
      where: {
        email: createVendorDto.email
      }
    })

    if(existingByEmail) {
      throw new ConflictException('Vendor email already exists')
    }

    const existingByPhone = await this.prisma.vendors.findUnique({
      where: {
        phone: createVendorDto.phone
      }
    })

    if(existingByPhone) {
      throw new ConflictException('Vendor phone already exists')
    }

    return await this.prisma.vendors.create({
      data: {
        fullName: createVendorDto.fullName,
        address: createVendorDto.address,
        email: createVendorDto.email,
        phone: createVendorDto.phone,
        description: createVendorDto.description,
        reference: createVendorDto.reference,
        company: createVendorDto.company
      }
    })
  }

  async findAll(skip: number, take: number) {
    const [vendors, total] = await this.prisma.$transaction([
      this.prisma.vendors.findMany({
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.vendors.count()
    ])

    return {
      vendors,
      total
    }
  }

  async findAllVendors() {
    return this.prisma.vendors.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findOne(id: string) {
    return this.prisma.vendors.findUnique({
      where: {id}
    });
  }

  async update(id: string, updateVendorDto: UpdateVendorDto) {
    return this.prisma.vendors.update({
      where: {id},
      data: updateVendorDto
    })
  }

  async remove(id: string) {
    return this.prisma.vendors.delete({
      where: {id}
    })
  }
}
