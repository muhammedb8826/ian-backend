import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Pricing } from './pricing.entity';
import { OrderItems } from './order-item.entity';
import { Item } from './item.entity';

@Entity()
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: true })
  status: boolean;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Pricing, pricing => pricing.service)
  pricing: Pricing[];

  @OneToMany(() => Item, item => item.services)
  items: Item[];

  @OneToMany(() => OrderItems, orderItems => orderItems.service)
  orderItems: OrderItems[];
}