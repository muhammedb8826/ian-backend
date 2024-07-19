import { Injectable, Req} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
    async getMe(@Req() req: Request) {
        return req.user;
    }

    async findAll() {
        return this.prisma.users.findMany({
            select: {
                id: true,
                email: true,
                createdAt: true,
            }
        });
    }
}
