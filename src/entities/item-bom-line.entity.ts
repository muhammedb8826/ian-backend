import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Item } from './item.entity';
import { UOM } from './uom.entity';
import { ItemBom } from './item-bom.entity';

@Entity('item_bom_line')
export class ItemBomLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itemBomId: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column()
  componentItemId: string;

  @Column()
  uomId: string;

  /** Consumption of this component per **1** unit of the parent item's order quantity (e.g. 2 meters film per 1 banner). */
  @Column('float')
  quantityPerUnit: number;

  @Column('float', { nullable: true })
  standardUnitCost: number;

  @Column('float', { nullable: true })
  standardUnitSellingPrice: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ItemBom, bom => bom.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemBomId' })
  itemBom: ItemBom;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'componentItemId' })
  componentItem: Item;

  @ManyToOne(() => UOM)
  @JoinColumn({ name: 'uomId' })
  uom: UOM;
}
