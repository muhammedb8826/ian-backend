import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { users } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService
  ) {}
  async create(createUserDto: CreateUserDto) : Promise<users> {
    return await this.prisma.users.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password,
        first_name: createUserDto.first_name,
        middle_name: createUserDto.middle_name,
        last_name: createUserDto.last_name,
        gender: createUserDto.gender,
        phone: createUserDto.phone,
        address: createUserDto.address,
        roles: createUserDto.roles,
        profile: createUserDto.profile,
        machinePermissions: createUserDto.machinePermissions,
        isActive: createUserDto.isActive
      }
    })
  }

  async findAll() {
    return this.prisma.users.findMany();
  }

  async findOne(id: string) {
    return this.prisma.users.findUnique({
      where: {
        id: id
      }
      });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.users.update({
      where: {
        id: id
      },
      data: {
        email: updateUserDto.email,
        password: updateUserDto.password,
        first_name: updateUserDto.first_name,
        middle_name: updateUserDto.middle_name,
        last_name: updateUserDto.last_name,
        gender: updateUserDto.gender,
        phone: updateUserDto.phone,
        address: updateUserDto.address,
        roles: updateUserDto.roles,
        profile: updateUserDto.profile,
        machinePermissions: updateUserDto.machinePermissions,
        isActive: updateUserDto.isActive
      }
    })
  }

  async remove(id: string) {
    return this.prisma.users.delete({
      where: {
        id: id
      }
    })
  }
}
