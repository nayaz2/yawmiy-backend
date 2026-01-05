import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * POST /admin/setup/first-admin - Create first admin (NO AUTH REQUIRED - ONE TIME USE)
   * This endpoint allows creating the first admin user without authentication.
   * After creating the first admin, you should disable or protect this endpoint.
   * 
   * Body: { email: string, password: string }
   */
  @Post('setup/first-admin')
  async createFirstAdmin(@Body() body: { email: string; password: string }) {
    return this.adminService.createFirstAdmin(body.email, body.password);
  }

  /**
   * GET /admin/users - List all users with filters and pagination
   * Query params: search, banned, role, page, limit
   */
  @Get('users')
  @UseGuards(JwtAuthGuard, AdminGuard) // Requires both JWT auth and admin role
  async listUsers(@Query() queryDto: QueryUsersDto) {
    return this.adminService.listUsers(queryDto);
  }

  /**
   * GET /admin/users/:id - Get user details
   */
  @Get('users/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getUserDetails(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new Error('Invalid user ID');
    }
    return this.adminService.getUserDetails(userId);
  }

  /**
   * POST /admin/users/:id/ban - Ban a user
   * Body: { reason: string }
   */
  @Post('users/:id/ban')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async banUser(
    @Param('id') id: string,
    @Body() banDto: BanUserDto,
    @Request() req,
  ) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new Error('Invalid user ID');
    }
    return this.adminService.banUser(userId, banDto, req.user.userId);
  }

  /**
   * POST /admin/users/:id/unban - Unban a user
   */
  @Post('users/:id/unban')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async unbanUser(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new Error('Invalid user ID');
    }
    return this.adminService.unbanUser(userId);
  }

  /**
   * PATCH /admin/users/:id/role - Update user role
   * Body: { role: 'user' | 'admin' }
   */
  @Patch('users/:id/role')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: 'user' | 'admin' },
    @Request() req,
  ) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new Error('Invalid user ID');
    }
    if (!body.role || (body.role !== 'user' && body.role !== 'admin')) {
      throw new Error('Invalid role. Must be "user" or "admin"');
    }
    return this.adminService.updateUserRole(userId, body.role, req.user.userId);
  }
}
