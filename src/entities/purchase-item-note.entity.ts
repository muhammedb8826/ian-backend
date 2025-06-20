import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { PurchaseItems } from './purchase-item.entity';
import { User } from './user.entity';

@Entity()
export class PurchaseItemNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  date: Date;

  @Column()
  hour: Date;

  @Column()
  @Index()
  purchaseItemId: string;

  @ManyToOne(() => PurchaseItems, purchaseItems => purchaseItems.purchaseItemNotes)
  purchaseItem: PurchaseItems;

  @ManyToOne(() => User, user => user.purchaseItemNotes)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}