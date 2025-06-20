import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Item } from './item.entity';
import { UOM } from './uom.entity';

@Entity()
export class OperatorStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itemId: string;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  description: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  uomId: string;

  @Column()
  baseUomId: string;

  @Column('float')
  unit: number;

  @ManyToOne(() => Item, item => item.operatorStock)
  item: Item;

  @ManyToOne(() => UOM, uom => uom.operatorStock)
  uoms: UOM;
}