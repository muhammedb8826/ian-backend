import { Controller, Get, Req, } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  async getMe(@Req() req: Request) {
    return this.userService.getMe(req);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }
}
