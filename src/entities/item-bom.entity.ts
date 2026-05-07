import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Item } from './item.entity';
import { ItemBomLine } from './item-bom-line.entity';

@Entity('item_bom')
export class ItemBom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Catalog item this BOM describes (finished good / sellable SKU). */
  @Column({ unique: true })
  itemId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ItemBomLine, line => line.itemBom, { cascade: true })
  lines: ItemBomLine[];

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'itemId' })
  item: Item;
}
