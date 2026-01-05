import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    email: string,
    password: string,
    student_id: string,
    name: string,
    role: 'user' | 'admin' = 'user',
  ): Promise<User> {
    const user = this.usersRepository.create({
      email,
      password, // Password should already be hashed before calling this method
      student_id,
      name,
      role,
      banned: false,
    });
    return this.usersRepository.save(user);
  }

  async findByStudentId(student_id: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { student_id } });
    return user === null ? undefined : user;
  }

  async findOne(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user === null ? undefined : user;
  }

  async findById(id: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user === null ? undefined : user;
  }
}

