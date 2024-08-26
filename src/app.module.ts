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
import { OperatorStockModule } from './operator-stock/operator-stock.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { CustomersModule } from './customers/customers.module';
import { SalesPartnersModule } from './sales-partners/sales-partners.module';
import { PaymentTermsModule } from './payment-terms/payment-terms.module';
import { PaymentTransactionsModule } from './payment-transactions/payment-transactions.module';
import { CommissionsModule } from './commissions/commissions.module';
import { CommissionTransactionsModule } from './commission-transactions/commission-transactions.module';
import { PricingModule } from './pricing/pricing.module';
import { OrderItemNotesModule } from './order-item-notes/order-item-notes.module';
@Module({
  imports: [AuthModule, PrismaModule, UsersModule, FileModule, MachinesModule, ServicesModule, ItemsModule, UnitCategoryModule, UomModule, VendorsModule, PurchasesModule, PurchaseItemsModule, PurchaseItemNotesModule, SalesModule, SaleItemsModule, SaleItemNotesModule, OperatorStockModule, OrdersModule, OrderItemsModule, CustomersModule, SalesPartnersModule, PaymentTermsModule, PaymentTransactionsModule, CommissionsModule, CommissionTransactionsModule, PricingModule, OrderItemNotesModule],
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
