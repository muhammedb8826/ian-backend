import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Item } from './item.entity';
import { OrderItems } from './order-item.entity';
import { UOM } from './uom.entity';

@Entity('order_item_components')
export class OrderItemComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderItemId: string;

  @Column()
  itemId: string;

  @Column()
  uomId: string;

  @Column('float')
  quantity: number;

  @Column('float')
  unitCost: number;

  @Column('float', { nullable: true })
  unitSellingPrice: number;

  @Column('float')
  totalCost: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => OrderItems, orderItem => orderItem.components, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderItemId' })
  orderItem: OrderItems;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @ManyToOne(() => UOM)
  @JoinColumn({ name: 'uomId' })
  uom: UOM;
}
