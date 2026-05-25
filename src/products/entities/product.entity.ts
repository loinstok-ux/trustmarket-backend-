import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('decimal')
  price: number;

  @Column({ default: 'Usuario Actual' })
  seller: string;

  @Column({ default: 'Caracas' })
  location: string;

  @Column({ default: 'Entrega Segura' })
  delivery: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'ACTIVE' })
  status: string;

  @Column({ default: true })
  verified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
