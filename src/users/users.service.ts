import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { users } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService
  ) { }
  async create(createUserDto: CreateUserDto): Promise<users> {
    if (createUserDto.password !== createUserDto.confirm_password) {
      throw new ForbiddenException('Passwords do not match');
    }

    const existingUserByEmail = await this.prisma.users.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingUser = await this.prisma.users.findUnique({
      where: {
        phone: createUserDto.phone,
      },
    });

    if (existingUser) {
      throw new ConflictException('Phone number already exists');
    }
    const boolValue = Boolean(createUserDto.is_active);
    const hashedPassword = await this.hashPassword(createUserDto.password);
    return await this.prisma.users.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        confirm_password: hashedPassword,
        first_name: createUserDto.first_name,
        middle_name: createUserDto.middle_name,
        last_name: createUserDto.last_name,
        gender: createUserDto.gender,
        phone: createUserDto.phone,
        address: createUserDto.address,
        roles: createUserDto.roles,
        profile: createUserDto.profile ? `/uploads/profile/${createUserDto.profile}` : null,
        machine_permissions: createUserDto.machine_permissions || undefined,
        is_active: boolValue
      }
    })
  }

  async findAll(skip: number, take: number) {
    const [users, total] = await this.prisma.$transaction([
      this.prisma.users.findMany({
        skip: Number(skip),
        take: Number(take),
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.users.count()
    ]);
    return {
      users,
      total
    }
  }

  async findAllUsers() {
    const users = await this.prisma.users.findMany();
    users.forEach(user => {
      if (user.profile) {
        user.profile = `/uploads/profile/${user.profile}`;
      }
    });
    return users;
  }

  async getOperators() {
    return await this.prisma.users.findMany({
      where: {
        roles: 'OPERATOR',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: id },
    });
    if (user && user.profile) {
      user.profile = `/uploads/profile/${user.profile}`;
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password && updateUserDto.password !== updateUserDto.confirm_password) {
      throw new ForbiddenException('Passwords do not match');
    }

    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const boolValue = Boolean(updateUserDto.is_active);

    const updateData: any = {
      email: updateUserDto.email,
      first_name: updateUserDto.first_name,
      middle_name: updateUserDto.middle_name,
      last_name: updateUserDto.last_name,
      gender: updateUserDto.gender,
      phone: updateUserDto.phone,
      address: updateUserDto.address,
      roles: updateUserDto.roles,
      profile: updateUserDto.profile ? `/uploads/profile/${updateUserDto.profile}` : null,
      machine_permissions: updateUserDto.machine_permissions || undefined,
      is_active: boolValue,
    };
    if (updateUserDto.password) {
      const hashedPassword = await this.hashPassword(updateUserDto.password);
      updateData.password = hashedPassword;
      updateData.confirm_password = hashedPassword;
    }

    return this.prisma.users.update({
      where: { id },
      data: updateData,
    });
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async remove(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.prisma.users.delete({
      where: { id },
    });
  }
}
