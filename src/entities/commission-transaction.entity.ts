import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Commission } from './commission.entity';

@Entity()
export class CommissionTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: Date;

  @Column('float')
  amount: number;

  @Column('float')
  percentage: number;

  @Column()
  commissionId: string;

  @Column()
  paymentMethod: string;

  @Column()
  reference: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Commission, commission => commission.transactions)
  commission: Commission;
}