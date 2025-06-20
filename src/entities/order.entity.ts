import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { SalesPartner } from './sales-partner.entity';
import { OrderItems } from './order-item.entity';
import { Commission } from './commission.entity';
import { PaymentTerm } from './payment-term.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  series: string;

  @Column()
  customerId: string;

  @Column()
  status: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  orderDate: Date;

  @Column()
  deliveryDate: Date;

  @Column('float')
  totalAmount: number;

  @Column('float')
  tax: number;

  @Column('float')
  grandTotal: number;

  @Column()
  totalQuantity: number;

  @Column({ nullable: true })
  internalNote: string;

  @Column({ nullable: true })
  paymentTermId: string;

  @Column({ nullable: true })
  commissionId: string;

  @Column('simple-array')
  fileNames: string[];

  @Column()
  adminApproval: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  salesPartnersId: string;

  @Column()
  orderSource: string;

  @OneToMany(() => OrderItems, orderItems => orderItems.order)
  orderItems: OrderItems[];

  @ManyToOne(() => Commission, commission => commission.order)
  commission: Commission;

  @ManyToOne(() => Customer, customer => customer.orders)
  customer: Customer;

  @ManyToOne(() => SalesPartner, salesPartner => salesPartner.orders)
  salesPartner: SalesPartner;

  @ManyToOne(() => PaymentTerm, paymentTerm => paymentTerm.order)
  paymentTerm: PaymentTerm;
}