import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Listing } from '../listings/listing.entity';
import { User } from '../users/user.entity';

export enum OrderStatus {
  PENDING = 'pending',
  ESCROWED = 'escrowed',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  order_id: string;

  @ManyToOne(() => Listing)
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @Column({ name: 'listing_id' })
  listing_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ name: 'buyer_id' })
  buyer_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ name: 'seller_id' })
  seller_id: number;

  @Column({ type: 'integer', name: 'item_price_paise' })
  item_price_paise: number;

  @Column({ type: 'integer', name: 'platform_fee_paise' })
  platform_fee_paise: number; // 10% of item price

  @Column({ type: 'integer', name: 'phonepe_fee_paise' })
  phonepe_fee_paise: number; // 1.5% of total

  @Column({ type: 'integer', name: 'total_paise' })
  total_paise: number; // Sum of all fees

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'payment_id', nullable: true })
  payment_id: string; // From PhonePe

  @Column({ name: 'meeting_location' })
  meeting_location: string;

  @Column({ name: 'meeting_time', type: 'timestamp', nullable: true })
  meeting_time: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completed_at: Date;
}

