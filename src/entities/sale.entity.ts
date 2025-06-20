import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { SaleItems } from './sale-item.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  series: string;

  @Column()
  operatorId: string;

  @Column()
  status: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  orderDate: Date;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  totalQuantity: number;

  @OneToMany(() => SaleItems, saleItems => saleItems.sale)
  saleItems: SaleItems[];

  @ManyToOne(() => User, user => user.operator)
  operator: User;
}