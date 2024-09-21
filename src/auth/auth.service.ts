import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService,private jwtService: JwtService) {}
    async signupLocal(dto: AuthDto): Promise<{ tokens: Tokens, user: any }> {
        try {
          const { email, password, phone, address } = dto;
          const hashedPassword = await this.hashPassword(password);
          const newUser = await this.prisma.users.create({
            data: {
              email,
              password: hashedPassword,
              confirm_password: hashedPassword,
              phone,
              address,
            },
          });
          const tokens = await this.getTokens(newUser.id, newUser.email);
          await this.updateRtHash(newUser.id, tokens.refreshToken);
          return { tokens, user: newUser };
        } catch (error) {
          throw new ForbiddenException('Error creating user: ' + error.message);
        }
      }

    async signinLocal(dto: AuthDto): Promise<{ tokens: Tokens, user: any }> {
        const email = dto.email.toLowerCase();
        const user = await this.prisma.users.findUnique({
            where: {
                email: email,
            }
        });

        // If no user is found, throw an error
    if (!user) {
        throw new NotFoundException(`No user found for email: ${email}`);
      }

        const passwordMatches = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatches) throw new ForbiddenException('Check password');
        
        const tokens = await this.getTokens( user.id, user.email)
        await this.updateRtHash(user.id, tokens.refreshToken)
        return {tokens, user}
    }


    async logout(userId: string){
        await this.prisma.users.updateMany({
            where: {
                id: userId,
                passwordRT: {
                    not: null
                }
            },
            data: {
                passwordRT: null
            }
        }) 
    }

    async refreshTokens(userId: string, rt:string){
        const user = await this.prisma.users.findUnique({
            where: {
                id: userId
            },
        });
        if(!user || !user.passwordRT) throw new ForbiddenException('Access Denied');
        const rtMatches = await bcrypt.compare(rt, user.passwordRT)
        if(!rtMatches) throw new ForbiddenException('Access Denied')

            const tokens = await this.getTokens( user.id, user.email)
        await this.updateRtHash(user.id, tokens.refreshToken)
        return {tokens, user}
    } 


    async hashPassword(password: string){
        return await bcrypt.hash(password, 10);
    }

    async getTokens(userId: string, email:string): Promise<Tokens>{
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub:userId,
                    email,
                },
                {
                    secret: 'at-secret',
                    expiresIn: 60 * 60 * 24,
                }
            ),
            this.jwtService.signAsync(
                {
                 sub: userId,
                 email,   
                },
                {
                    secret: 'rt-secret',
                    expiresIn: 60 * 60 * 24 * 3,
                }
            )
        ]);

        return {
            accessToken: at,
            refreshToken: rt
        }
    }

    async updateRtHash(userId: string, rt:string){
        const hash = await this.hashPassword(rt);
        await this.prisma.users.update({
            where: {
                id: userId,
            },
            data: {
                passwordRT: hash
            }
        })
    }
}
