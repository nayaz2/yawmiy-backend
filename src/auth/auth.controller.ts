import { Controller, Post, Body, UseGuards, Request, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register endpoint
   * Input: email, password, student_id, name
   * Email validation: must end with .edu
   * Student ID: 8-10 digits, locked after registration
   * Password: min 8 chars, 1 uppercase, 1 number, 1 special char
   * Returns: success message
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.student_id,
      registerDto.name,
    );
  }

  /**
   * Login endpoint
   * Input: email, password
   * Returns: token + user info
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  /**
   * Validate token endpoint
   * Input: JWT token in Authorization header
   * Returns: user data
   */
  @Post('validate-token')
  async validateToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header with Bearer token is required');
    }
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    return this.authService.validateToken(token);
  }
}

