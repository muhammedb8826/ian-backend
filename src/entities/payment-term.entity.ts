import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { PaymentTransaction } from './payment-transaction.entity';

@Entity()
export class PaymentTerm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderId: string;

  @Column('float')
  totalAmount: number;

  @Column('float')
  remainingAmount: number;

  @Column()
  status: string;

  @Column()
  forcePayment: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Order, order => order.paymentTerm)
  order: Order;

  @OneToMany(() => PaymentTransaction, transaction => transaction.paymentTerm)
  transactions: PaymentTransaction[];
}