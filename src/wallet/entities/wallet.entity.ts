import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('wallets')
export class Wallet {
  @PrimaryColumn()
  userId: string; // En el futuro será llave foránea a User

  @Column('decimal', { default: 0 })
  availableBalance: number;

  @Column('decimal', { default: 0 })
  frozenBalance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
