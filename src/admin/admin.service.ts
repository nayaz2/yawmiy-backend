import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../users/user.entity';
import { QueryUsersDto } from './dto/query-users.dto';
import { BanUserDto } from './dto/ban-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Create first admin user (one-time setup)
   * Only works if no admin exists in the system
   * This allows creating the first admin without authentication
   */
  async createFirstAdmin(email: string, password: string): Promise<{
    message: string;
    user: {
      id: number;
      email: string;
      name: string;
      role: 'admin';
    };
  }> {
    // Check if any admin already exists
    const existingAdmin = await this.usersRepository.findOne({
      where: { role: 'admin' },
    });

    if (existingAdmin) {
      throw new ConflictException(
        'Admin user already exists. Use the admin endpoints to create additional admins.',
      );
    }

    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      // If user exists, just update their role to admin
      existingUser.role = 'admin';
      await this.usersRepository.save(existingUser);

      return {
        message: 'Existing user promoted to admin successfully',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: 'admin',
        },
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    // Note: We're bypassing normal registration validation for setup
    const adminUser = this.usersRepository.create({
      email,
      password: hashedPassword,
      student_id: `ADMIN${Date.now()}`, // Generate unique student_id for admin
      name: 'Admin User',
      role: 'admin',
      banned: false,
    });

    const savedUser = await this.usersRepository.save(adminUser);

    return {
      message: 'First admin user created successfully',
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: 'admin',
      },
    };
  }

  /**
   * List all users with filters and pagination
   */
  async listUsers(queryDto: QueryUsersDto): Promise<{
    users: Array<{
      id: number;
      email: string;
      name: string;
      student_id: string;
      role: 'user' | 'admin';
      banned: boolean;
      banned_at: Date | null;
      banned_reason: string | null;
      created_at?: Date;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Search filter
    if (queryDto.search) {
      const searchTerm = `%${queryDto.search}%`;
      queryBuilder.where(
        '(LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: searchTerm },
      );
    }

    // Banned filter
    if (queryDto.banned !== undefined) {
      if (queryDto.search) {
        queryBuilder.andWhere('user.banned = :banned', { banned: queryDto.banned });
      } else {
        queryBuilder.where('user.banned = :banned', { banned: queryDto.banned });
      }
    }

    // Role filter
    if (queryDto.role) {
      if (queryDto.search || queryDto.banned !== undefined) {
        queryBuilder.andWhere('user.role = :role', { role: queryDto.role });
      } else {
        queryBuilder.where('user.role = :role', { role: queryDto.role });
      }
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Order by created_at (newest first)
    queryBuilder.orderBy('user.id', 'DESC');

    // Pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Select only necessary fields (exclude password)
    queryBuilder.select([
      'user.id',
      'user.email',
      'user.name',
      'user.student_id',
      'user.role',
      'user.banned',
      'user.banned_at',
      'user.banned_reason',
    ]);

    const users = await queryBuilder.getMany();

    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        student_id: user.student_id,
        role: user.role,
        banned: user.banned,
        banned_at: user.banned_at,
        banned_reason: user.banned_reason,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Ban a user
   */
  async banUser(userId: number, banDto: BanUserDto, adminId: number): Promise<{
    id: number;
    email: string;
    name: string;
    banned: boolean;
    banned_at: Date;
    banned_reason: string;
  }> {
    // Cannot ban yourself
    if (userId === adminId) {
      throw new BadRequestException('Cannot ban yourself');
    }

    // Find user
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Cannot ban admins
    if (user.role === 'admin') {
      throw new ForbiddenException('Cannot ban admin users');
    }

    // Check if already banned
    if (user.banned) {
      throw new BadRequestException('User is already banned');
    }

    // Ban user
    user.banned = true;
    user.banned_at = new Date();
    user.banned_reason = banDto.reason.trim();

    await this.usersRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      banned: user.banned,
      banned_at: user.banned_at,
      banned_reason: user.banned_reason,
    };
  }

  /**
   * Unban a user
   */
  async unbanUser(userId: number): Promise<{
    id: number;
    email: string;
    name: string;
    banned: boolean;
    banned_at: Date | null;
    banned_reason: string | null;
  }> {
    // Find user
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already unbanned
    if (!user.banned) {
      throw new BadRequestException('User is not banned');
    }

    // Unban user
    user.banned = false;
    user.banned_at = null;
    user.banned_reason = null;

    await this.usersRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      banned: user.banned,
      banned_at: user.banned_at,
      banned_reason: user.banned_reason,
    };
  }

  /**
   * Get user details (admin view)
   */
  async getUserDetails(userId: number): Promise<{
    id: number;
    email: string;
    name: string;
    student_id: string;
    role: 'user' | 'admin';
    banned: boolean;
    banned_at: Date | null;
    banned_reason: string | null;
    recruiter_id: number | null;
  }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'name',
        'student_id',
        'role',
        'banned',
        'banned_at',
        'banned_reason',
        'recruiter_id',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      student_id: user.student_id,
      role: user.role,
      banned: user.banned,
      banned_at: user.banned_at,
      banned_reason: user.banned_reason,
      recruiter_id: user.recruiter_id,
    };
  }

  /**
   * Update user role (promote to admin or demote to user)
   */
  async updateUserRole(
    userId: number,
    newRole: 'user' | 'admin',
    adminId: number,
  ): Promise<{
    id: number;
    email: string;
    role: 'user' | 'admin';
  }> {
    // Cannot change your own role
    if (userId === adminId) {
      throw new BadRequestException('Cannot change your own role');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === newRole) {
      throw new BadRequestException(`User is already ${newRole}`);
    }

    user.role = newRole;
    await this.usersRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}

