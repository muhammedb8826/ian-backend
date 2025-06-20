import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UOM } from './uom.entity';
import { Item } from './item.entity';

@Entity()
export class UnitCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  constant: boolean;

  @Column('float')
  constantValue: number;

  @OneToMany(() => UOM, uom => uom.unitCategory)
  uoms: UOM[];

  @OneToMany(() => Item, item => item.unitCategory)
  items: Item[];
}