import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService){}
  async create(createCustomerDto: CreateCustomerDto) {
     // Check for existing customer by phone number
     const existingCustomerByPhone = await this.prisma.customers.findUnique({
      where: {
        phone: createCustomerDto.phone,
      },
    });

    if (existingCustomerByPhone) {
      throw new ConflictException('Customer with this phone number already exists');
    }

    // Check for existing customer by email, but only if email is provided
    if (createCustomerDto.email) {
      const existingCustomerByEmail = await this.prisma.customers.findUnique({
        where: {
          email: createCustomerDto.email,
        },
      });

      if (existingCustomerByEmail) {
        throw new ConflictException('Customer with this email already exists');
      }
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
    
    // Check for existing customer by phone number
    const existingCustomerByPhone = await this.prisma.customers.findFirst({
      where: {
        phone: updateCustomerDto.phone,
        NOT: {
          id
        }
      }
    });

    if (existingCustomerByPhone) {
      throw new ConflictException('Customer with this phone number already exists');
    }

    // Check for existing customer by email, but only if email is provided
    if (updateCustomerDto.email) {
      const existingCustomerByEmail = await this.prisma.customers.findFirst({
        where: {
          email: updateCustomerDto.email,
          NOT: {
            id
          }
        }
      });

      if (existingCustomerByEmail) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

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
