import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  type: 'DEPOSIT' | 'WITHDRAW' | 'ESCROW_LOCK' | 'ESCROW_RELEASE';

  @Column('decimal')
  amount: number;

  @Column({ nullable: true })
  relatedProductId: string;

  @Column()
  status: 'PENDING' | 'COMPLETED' | 'FAILED';

  @CreateDateColumn()
  createdAt: Date;
}
