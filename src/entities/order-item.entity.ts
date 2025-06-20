import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Order } from './order.entity';
import { Item } from './item.entity';
import { Service } from './service.entity';
import { Pricing } from './pricing.entity';
import { UOM } from './uom.entity';
import { OrderItemNotes } from './order-item-notes.entity';

@Entity()
@Unique(['orderId', 'itemId', 'serviceId'])
export class OrderItems {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column()
  itemId: string;

  @Column()
  serviceId: string;

  @Column('float', { nullable: true })
  width: number;

  @Column('float', { nullable: true })
  height: number;

  @Column('float', { nullable: true })
  discount: number;

  @Column()
  level: number;

  @Column('float')
  totalAmount: number;

  @Column()
  adminApproval: boolean;

  @Column()
  uomId: string;

  @Column()
  quantity: number;

  @Column('float')
  unitPrice: number;

  @Column({ nullable: true })
  description: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  isDiscounted: boolean;

  @Column()
  pricingId: string;

  @Column()
  baseUomId: string;

  @Column('float')
  unit: number;

  @OneToMany(() => OrderItemNotes, orderItemNotes => orderItemNotes.orderItem)
  orderItemNotes: OrderItemNotes[];

  @ManyToOne(() => Item, item => item.OrderItems)
  item: Item;

  @ManyToOne(() => Order, order => order.orderItems)
  order: Order;

  @ManyToOne(() => Pricing, pricing => pricing.orderItems)
  pricing: Pricing;

  @ManyToOne(() => UOM, uom => uom.orderItems)
  uom: UOM;

  @ManyToOne(() => Service, service => service.orderItems)
  service: Service;
}