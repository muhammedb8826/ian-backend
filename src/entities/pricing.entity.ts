import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { OrderItems } from './order-item.entity';
import { UOM } from './uom.entity';
import { Item } from './item.entity';
import { Service } from './service.entity';

@Entity()
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

  @OneToMany(() => OrderItems, orderItems => orderItems.pricing)
  orderItems: OrderItems[];

  @ManyToOne(() => UOM, uom => uom.pricing)
  uom: UOM;

  @ManyToOne(() => Item, item => item.pricing)
  item: Item;

  @ManyToOne(() => Service, service => service.pricing)
  service: Service;
}