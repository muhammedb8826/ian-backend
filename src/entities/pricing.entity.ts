import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { Item } from './item.entity';
import { Service } from './service.entity';
import { UOM } from './uom.entity';
import { OrderItems } from './order-item.entity';

@Entity('pricing')
@Unique(['itemId', 'serviceId'])
export class Pricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itemId: string;

  @Column()
  serviceId: string;

  @Column('float')
  sellingPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  constant: boolean;

  @Column('float', { nullable: true })
  height: number;

  @Column('float', { nullable: true })
  width: number;

  @Column()
  baseUomId: string;

  @ManyToOne(() => UOM, uom => uom.pricing)
  @JoinColumn({ name: 'baseUomId' })
  uom: UOM;

  @ManyToOne(() => Item, item => item.pricing)
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @ManyToOne(() => Service, service => service.pricing)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @OneToMany(() => OrderItems, orderItems => orderItems.pricing)
  orderItems: OrderItems[];
}