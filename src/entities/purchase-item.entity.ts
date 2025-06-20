import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Item } from './item.entity';
import { Purchase } from './purchase.entity';
import { UOM } from './uom.entity';
import { PurchaseItemNote } from './purchase-item-note.entity';

@Entity()
@Unique(['purchaseId', 'itemId'])
export class PurchaseItems {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  purchaseId: string;

  @Column()
  itemId: string;

  @Column()
  quantity: number;

  @Column('float')
  unitPrice: number;

  @Column('float')
  amount: number;

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

  @OneToMany(() => PurchaseItemNote, purchaseItemNote => purchaseItemNote.purchaseItem)
  purchaseItemNotes: PurchaseItemNote[];

  @ManyToOne(() => Item, item => item.purchases)
  item: Item;

  @ManyToOne(() => Purchase, purchase => purchase.purchaseItems)
  purchase: Purchase;

  @ManyToOne(() => UOM, uom => uom.purchaseItems)
  uoms: UOM;
}