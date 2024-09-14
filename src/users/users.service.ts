import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role} from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService
  ) { }
  async create(createUserDto: CreateUserDto) {
    if (createUserDto.password !== createUserDto.confirm_password) {
      throw new ForbiddenException('Passwords do not match');
    }

    await this.checkForExistingUser(createUserDto.email, createUserDto.phone);

    const hashedPassword = await this.hashPassword(createUserDto.password);
    const isActive = Boolean(createUserDto.is_active);

    return this.prisma.users.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        confirm_password: hashedPassword,
        is_active: isActive,
        profile: createUserDto.profile ? `/uploads/profile/${createUserDto.profile}` : null,
      },
    });
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
    return users.map(user => ({
      ...user,
      profile: user.profile ? `/uploads/profile/${user.profile}` : null,
    }));
  }

  async getUserByRole(role: Role) {
    const users = await this.prisma.users.findMany({
      where: { roles: role },
    });
    return users.map(user => ({
      ...user,
      profile: user.profile ? `/uploads/profile/${user.profile}` : null,
    }));
  }


  async findOne(id: string) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return {
      ...user,
      profile: user.profile ? `/uploads/profile/${user.profile}` : null,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    if (updateUserDto.password && updateUserDto.password !== updateUserDto.confirm_password) {
      throw new ForbiddenException('Passwords do not match');
    }

    const updateData: Partial<UpdateUserDto> = { ...updateUserDto };
    if (updateUserDto.password) {
      const hashedPassword = await this.hashPassword(updateUserDto.password);
      updateData.password = hashedPassword;
      updateData.confirm_password = hashedPassword;
    }

    return this.prisma.users.update({
      where: { id },
      data: {
        ...updateData,
        is_active: Boolean(updateUserDto.is_active),
        profile: updateUserDto.profile ? `/uploads/profile/${updateUserDto.profile}` : user.profile,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return this.prisma.users.delete({ where: { id } });
  }


  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  private async checkForExistingUser(email: string, phone: string) {
    const [existingEmailUser, existingPhoneUser] = await this.prisma.$transaction([
      this.prisma.users.findUnique({ where: { email } }),
      this.prisma.users.findUnique({ where: { phone } }),
    ]);

    if (existingEmailUser) {
      throw new ConflictException('Email already exists');
    }

    if (existingPhoneUser) {
      throw new ConflictException('Phone number already exists');
    }
  }
}
