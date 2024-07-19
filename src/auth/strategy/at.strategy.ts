import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt,  Strategy } from 'passport-jwt';
import { PrismaService } from "src/prisma/prisma.service";

type JwtPayload = {
    sub: string,
    email: string
}

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'at-secret',
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.prisma.users.findUnique({
            where: {
                id: payload.sub
            }
        })
        delete user.password
        return user;
    }
}