import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Vendor } from './vendor.entity';
import { PurchaseItems } from './purchase-item.entity';

@Entity()
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  series: string;

  @Column()
  vendorId: string;

  @Column()
  status: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  orderDate: Date;

  @Column()
  paymentMethod: string;

  @Column('float')
  amount: number;

  @Column()
  reference: string;

  @Column('float')
  totalAmount: number;

  @Column()
  totalQuantity: number;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  purchaserId: string;

  @OneToMany(() => PurchaseItems, purchaseItems => purchaseItems.purchase)
  purchaseItems: PurchaseItems[];

  @ManyToOne(() => User, user => user.purchaser)
  purchaser: User;

  @ManyToOne(() => Vendor, vendor => vendor.purchases)
  vendor: Vendor;
}