import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Item } from './item.entity';

@Entity()
@Unique(['itemId', 'level'])
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  level: number;

  @Column()
  itemId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('float')
  percentage: number;

  @Column('float')
  unit: number;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Item, item => item.discounts)
  item: Item;
}