import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Machine } from './machine.entity';

@Entity()
@Unique(['userId', 'machineId'])
export class UserMachine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  machineId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Machine, machine => machine.users)
  machine: Machine;

  @ManyToOne(() => User, user => user.machines)
  user: User;
}