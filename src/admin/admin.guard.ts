import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Authentication required');
    }

    // Get user from database to check role
    const dbUser = await this.usersRepository.findOne({
      where: { id: user.userId },
    });
    if (!dbUser) {
      throw new ForbiddenException('User not found');
    }

    // Check if user is banned
    if (dbUser.banned) {
      throw new ForbiddenException('Your account has been banned');
    }

    // Check if user is admin
    if (dbUser.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    // Attach full user object to request for use in controllers
    request.adminUser = dbUser;

    return true;
  }
}

