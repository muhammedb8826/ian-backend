import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService){}
  async create(createCustomerDto: CreateCustomerDto) {
    const customer = await this.prisma.customers.findUnique({
      where: {
        fullName_phone_email: {
          fullName: createCustomerDto.fullName,
          email: createCustomerDto.email,
          phone: createCustomerDto.phone,
        },
      },
    });

   if(customer) {
      throw new ConflictException('Customer already exists')
    }

    return this.prisma.customers.create({
      data: {
        fullName: createCustomerDto.fullName,
        address: createCustomerDto.address,
        email: createCustomerDto.email,
        phone: createCustomerDto.phone,
        company: createCustomerDto.company,
        description: createCustomerDto.description
      }
    })
  }

  async findAll(skip: number, take: number) {
    const [customers, total] =await this.prisma.$transaction([
      this.prisma.customers.findMany({
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.customers.count()
    ])

    return {customers, total}
  }

  async findAllCustomers(search? : string) {
    return this.prisma.customers.findMany({
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
          }
        ],
      } : {},
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findOne(id: string) {
    return this.prisma.customers.findUnique({
      where: {
        id
      }
    })
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customers.update({
      where: {
        id
      },
      data: updateCustomerDto
    })
  }

  async remove(id: string) {
    return this.prisma.customers.delete({
      where: {
        id
      }
    })
  }
}
