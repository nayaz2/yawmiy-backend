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
}

