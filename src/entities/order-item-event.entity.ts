import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItems } from './order-item.entity';

export type OrderItemEventType = 'PRODUCTION' | 'PRINT' | 'QUALITY_CONTROL' | 'DELIVERY';

@Entity('order_item_events')
export class OrderItemEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderItemId: string;

  @ManyToOne(() => OrderItems, orderItem => orderItem.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderItemId' })
  orderItem: OrderItems;

  @Column({ type: 'varchar', length: 32 })
  type: OrderItemEventType;

  @Column('float')
  quantity: number;

  /** Optional freeform note describing why/what was recorded. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  note?: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

