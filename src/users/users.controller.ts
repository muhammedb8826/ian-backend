import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, BadRequestException, UploadedFile, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Role } from '@prisma/client';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('profile', {
    storage: diskStorage({
      destination: './uploads/profile',
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
        cb(null, uniqueSuffix);
      },
    }),
    fileFilter: (req, file, cb) => {
      const validExtensions = /\.(jpg|jpeg|png|gif|webp|tiff|bmp)$/i;
      if (!file.originalname.match(validExtensions)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
  }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createUserDto: CreateUserDto) {
    if (file) {
      createUserDto.profile = file.filename; // Save the filename in the DTO
    }
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const skip = (page - 1) * limit;
    const take = limit;
    return this.usersService.findAll(skip, take);
  }

  @Get('all')
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get('by-role')
  getUserByRole(@Query('roles') roles?: Role): Promise<User[]> {
    if (roles) {
      return this.usersService.getUserByRole(roles);
    }
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('profile', {
      storage: diskStorage({
          destination: './uploads/profile',
          filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
            cb(null, uniqueSuffix);
          },
        }),
        fileFilter: (req, file, cb) => {
          const validExtensions = /\.(jpg|jpeg|png|gif|webp|tiff|bmp)$/i;
          if (!file.originalname.match(validExtensions)) {
            return cb(new BadRequestException('Only image files are allowed!'), false);
          }
          cb(null, true);
        },
  }))
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @UploadedFile() profile: Express.Multer.File) {
      if (profile) {
          updateUserDto.profile = profile.filename;
      }
      return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
