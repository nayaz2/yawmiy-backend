import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, update: false }) // IMMUTABLE - cannot change after creation
  email: string;

  @Column()
  password: string;

  @Column({ unique: true, update: false }) // Locked after registration
  student_id: string;

  @Column()
  name: string;

  @Column({ name: 'recruiter_id', nullable: true })
  recruiter_id: number; // ID of the scout who recruited this user

  @Column({
    type: 'enum',
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: 'user' | 'admin';

  @Column({ default: false })
  banned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  banned_at: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  banned_reason: string | null;
}

