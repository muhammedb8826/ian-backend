import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { SaleItems } from './sale-item.entity';
import { User } from './user.entity';

@Entity()
export class SalesItemNote {
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
  saleItemId: string;

  @ManyToOne(() => SaleItems, saleItems => saleItems.saleItemNotes)
  saleItem: SaleItems;

  @ManyToOne(() => User, user => user.salesNotes)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}