import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Scout } from '../scouts/scout.entity';
import { Order } from '../orders/order.entity';

export enum PayoutType {
  SCOUT_BOUNTY = 'scout_bounty', // Scout earnings
  SELLER_PAYOUT = 'seller_payout', // Seller earnings from order
}

export enum PayoutStatus {
  PAYABLE = 'payable', // Ready to be paid, waiting for scheduled payment date (1st or 16th)
  PENDING = 'pending', // Requested, waiting to process
  PROCESSING = 'processing', // Currently being processed
  COMPLETED = 'completed', // Successfully paid out
  FAILED = 'failed', // Payment failed
  CANCELLED = 'cancelled', // Cancelled by admin
}

@Entity('payouts')
@Index(['status', 'created_at'])
@Index(['user_id', 'status'])
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  payout_id: string;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: PayoutType,
  })
  payout_type: PayoutType;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  status: PayoutStatus;

  @Column({ name: 'amount_paise', type: 'integer' })
  amount_paise: number; // Amount in paise

  @Column({ name: 'scout_id', nullable: true })
  scout_id: string;

  @ManyToOne(() => Scout, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'scout_id' })
  scout: Scout;

  @Column({ name: 'order_id', nullable: true })
  order_id: string;

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ nullable: true })
  payment_reference: string | null; // External payment reference (e.g., PhonePe transaction ID)

  @Column({ nullable: true, type: 'text' })
  failure_reason: string | null; // Reason for failure if status is FAILED

  @Column({ nullable: true, type: 'timestamp' })
  processed_at: Date | null; // When payout was processed

  @Column({ nullable: true, type: 'timestamp' })
  completed_at: Date | null; // When payout was completed

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

