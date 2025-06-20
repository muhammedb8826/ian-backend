import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Item } from './item.entity';
import { Sale } from './sale.entity';
import { UOM } from './uom.entity';
import { SalesItemNote } from './sales-item-note.entity';

@Entity()
export class SaleItems {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  saleId: string;

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

  @ManyToOne(() => Item, item => item.sales)
  item: Item;

  @ManyToOne(() => Sale, sale => sale.saleItems)
  sale: Sale;

  @ManyToOne(() => UOM, uom => uom.saleItems)
  uoms: UOM;

  @OneToMany(() => SalesItemNote, salesItemNote => salesItemNote.saleItem)
  saleItemNotes: SalesItemNote[];
}