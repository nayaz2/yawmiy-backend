import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
import { Order } from '../orders/order.entity';

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

@Entity('messages')
@Index(['sender_id', 'recipient_id'])
@Index(['listing_id'])
@Index(['order_id'])
@Index(['created_at'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'sender_id' })
  sender_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ name: 'recipient_id' })
  recipient_id: number;

  @Column({ type: 'text' })
  content: string;

  // Optional: Link message to a listing (for listing-related conversations)
  @ManyToOne(() => Listing, { nullable: true })
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @Column({ name: 'listing_id', nullable: true })
  listing_id?: string;

  // Optional: Link message to an order (for order-related conversations)
  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id', nullable: true })
  order_id?: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({ nullable: true })
  read_at: Date;

  @CreateDateColumn()
  created_at: Date;
}





