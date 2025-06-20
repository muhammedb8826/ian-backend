import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { SalesPartner } from './sales-partner.entity';
import { CommissionTransaction } from './commission-transaction.entity';

@Entity()
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderId: string;

  @Column()
  salesPartnerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('float')
  totalAmount: number;

  @Column('float')
  paidAmount: number;

  @OneToMany(() => CommissionTransaction, transaction => transaction.commission)
  transactions: CommissionTransaction[];

  @ManyToOne(() => Order, order => order.commission)
  order: Order;

  @ManyToOne(() => SalesPartner, salesPartner => salesPartner.commissions)
  salesPartner: SalesPartner;
}