import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common';
import { UsersModule } from './users/users.module';
import { FileController } from './file/file.controller';
import { FileModule } from './file/file.module';
import { MachinesModule } from './machines/machines.module';

@Module({
  imports: [AuthModule, PrismaModule, UsersModule, FileModule, MachinesModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard
    },
  ],
  controllers: [FileController]
})
export class AppModule {}
