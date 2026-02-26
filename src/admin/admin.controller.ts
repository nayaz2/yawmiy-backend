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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('setup/first-admin')
  @ApiOperation({ 
    summary: 'Create first admin (Setup)',
    description: 'Create the first admin user. NO AUTH REQUIRED - ONE TIME USE ONLY. After creating the first admin, this endpoint should be disabled or protected.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'admin@university.edu' },
        password: { type: 'string', example: 'AdminPassword123!' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'First admin created successfully',
    schema: {
      example: {
        message: 'First admin user created successfully',
        user: {
          id: 1,
          email: 'admin@university.edu',
          name: 'Admin User',
          role: 'admin'
        }
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Admin already exists' })
  async createFirstAdmin(@Body() body: { email: string; password: string }) {
    return this.adminService.createFirstAdmin(body.email, body.password);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'List users (Admin)',
    description: 'List all users with optional filters (search, banned status, role) and pagination. Admin only.'
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async listUsers(@Query() queryDto: QueryUsersDto) {
    return this.adminService.listUsers(queryDto);
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user details (Admin)',
    description: 'Get detailed information about a specific user. Admin only.'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserDetails(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new Error('Invalid user ID');
    }
    return this.adminService.getUserDetails(userId);
  }

  @Post('users/:id/ban')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Ban user (Admin)',
    description: 'Ban a user with a reason. Admin only. Cannot ban other admins or yourself.'
  })
  @ApiParam({ name: 'id', description: 'User ID to ban', example: 1 })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  @ApiResponse({ status: 400, description: 'Cannot ban admin or yourself' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
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

  @Post('users/:id/unban')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Unban user (Admin)',
    description: 'Unban a previously banned user. Admin only.'
  })
  @ApiParam({ name: 'id', description: 'User ID to unban', example: 1 })
  @ApiResponse({ status: 200, description: 'User unbanned successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async unbanUser(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new Error('Invalid user ID');
    }
    return this.adminService.unbanUser(userId);
  }

  @Patch('users/:id/role')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update user role (Admin)',
    description: 'Update a user\'s role (user or admin). Admin only. Cannot change your own role.'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['user', 'admin'], example: 'admin' },
      },
      required: ['role'],
    },
  })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot change your own role' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
