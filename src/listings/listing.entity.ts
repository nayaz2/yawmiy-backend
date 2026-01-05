import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ListingCategory {
  TEXTBOOKS = 'Textbooks',
  ELECTRONICS = 'Electronics',
  FURNITURE = 'Furniture',
  CLOTHING = 'Clothing',
  SPORTS = 'Sports',
  STATIONERY = 'Stationery',
  SNACKS = 'Snacks',
  BEVERAGES = 'Beverages',
  OTHER = 'Other',
}

export enum ListingCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
}

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  DELISTED = 'delisted',
}

@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ name: 'seller_id' })
  seller_id: number; // Foreign key column

  @Column({ length: 100 })
  title: string;

  @Column({
    type: 'enum',
    enum: ListingCategory,
  })
  category: ListingCategory;

  @Column({ type: 'integer' }) // Price stored in paise
  price: number;

  @Column({
    type: 'enum',
    enum: ListingCondition,
  })
  condition: ListingCondition;

  @Column({ length: 500 })
  description: string;

  // Full-text search vector (automatically updated by database trigger)
  // Note: This column is managed by PostgreSQL, not TypeORM
  // It's added via migration: database/migrations/add-fulltext-search.sql
  // TypeORM doesn't support tsvector directly, so we use 'text' type
  // The actual database column will be tsvector type
  @Column({
    type: 'text',
    nullable: true,
    select: false, // Don't select by default (not needed in queries)
    name: 'search_vector',
  })
  search_vector?: string;

  @Column({ type: 'json', nullable: true })
  photos: string[];

  @Column()
  location: string;

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.ACTIVE,
  })
  status: ListingStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

