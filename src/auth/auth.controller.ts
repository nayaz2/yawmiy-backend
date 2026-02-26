import { Controller, Post, Body, UseGuards, Request, UnauthorizedException, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Register a new student user. Email must end with .edu, .edu.in, .ac, or .ac.in. Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character.'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    schema: {
      example: {
        message: 'Registration successful'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input or validation error' })
  @ApiResponse({ status: 409, description: 'Email or Student ID already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.student_id,
      registerDto.name,
    );
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Login user',
    description: 'Authenticate user with email and password. Returns JWT token and user information.'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'student@university.edu',
          name: 'John Doe',
          student_id: '12345678',
          role: 'user',
          created_at: '2024-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials or banned account' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('validate-token')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Validate JWT token',
    description: 'Validate a JWT token and return user data. Token should be provided in Authorization header as Bearer token.'
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ 
    status: 200, 
    description: 'Token is valid',
    schema: {
      example: {
        id: 1,
        email: 'student@university.edu',
        name: 'John Doe',
        student_id: '12345678',
        role: 'user',
        created_at: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async validateToken(@Request() req) {
    // JWT guard already validated the token and attached user info to request
    // Fetch full user data from database
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user data (without password)
    const { password: _, ...userInfo } = user;
    return userInfo;
  }
}

