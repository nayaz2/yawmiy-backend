import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ScoutStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('scouts')
export class Scout {
  @PrimaryGeneratedColumn('uuid')
  scout_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({
    type: 'enum',
    enum: ScoutStatus,
    default: ScoutStatus.ACTIVE,
  })
  status: ScoutStatus;

  @Column({ name: 'recruits_count', default: 0 })
  recruits_count: number;

  @Column({ name: 'earnings_paise', type: 'integer', default: 0 })
  earnings_paise: number; // Total bounties earned (in paise)

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

