import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common';
import { UsersModule } from './users/users.module';
import { FileController } from './file/file.controller';
import { FileModule } from './file/file.module';
import { MachinesModule } from './machines/machines.module';
import { UserMachineController } from './user-machine/user-machine.controller';
import { UserMachineService } from './user-machine/user-machine.service';
import { UsersController } from './users/users.controller';
import { MachinesController } from './machines/machines.controller';
import { UsersService } from './users/users.service';
import { PrismaService } from './prisma/prisma.service';
import { MachinesService } from './machines/machines.service';
import { ServicesModule } from './services/services.module';
import { ItemsModule } from './items/items.module';
import { UnitCategoryModule } from './unit-category/unit-category.module';
import { UomModule } from './uom/uom.module';
import { VendorsModule } from './vendors/vendors.module';
import { PurchasesModule } from './purchases/purchases.module';
import { PurchaseItemsModule } from './purchase-items/purchase-items.module';
import { PurchaseItemNotesModule } from './purchase-item-notes/purchase-item-notes.module';
import { SalesModule } from './sales/sales.module';
import { SaleItemsModule } from './sale-items/sale-items.module';
import { SaleItemNotesModule } from './sale-item-notes/sale-item-notes.module';
@Module({
  imports: [AuthModule, PrismaModule, UsersModule, FileModule, MachinesModule, ServicesModule, ItemsModule, UnitCategoryModule, UomModule, VendorsModule, PurchasesModule, PurchaseItemsModule, PurchaseItemNotesModule, SalesModule, SaleItemsModule, SaleItemNotesModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard
    },
    UserMachineService,
    UsersService,
    PrismaService,
    MachinesService
  ],
  controllers: [FileController, UserMachineController, UsersController, MachinesController]
})
export class AppModule {}
