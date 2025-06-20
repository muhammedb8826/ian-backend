import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { OrderItems } from './order-item.entity';
import { User } from './user.entity';

@Entity()
export class OrderItemNotes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column()
  hour: Date;

  @Column()
  date: Date;

  @Column()
  userId: string;

  @Column()
  orderItemId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => OrderItems, orderItems => orderItems.orderItemNotes)
  orderItem: OrderItems;

  @ManyToOne(() => User, user => user.orderItemNotes)
  user: User;
}