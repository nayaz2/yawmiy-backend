import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new student user
   * @param email - Must end with .edu
   * @param password - Min 8 chars, 1 uppercase, 1 number, 1 special char
   * @param student_id - 8-10 digits, locked after registration
   * @param name - Student's full name
   * @returns Success message
   */
  async register(email: string, password: string, student_id: string, name: string): Promise<{ message: string }> {
    // Validate email format (must end with .edu, .edu.in, .ac, or .ac.in)
    const emailPattern = /\.(edu|ac)(\.in)?$/;
    if (!emailPattern.test(email)) {
      throw new BadRequestException('Email must end with .edu, .edu.in, .ac, or .ac.in');
    }

    // Check if email already exists
    const existingUserByEmail = await this.usersService.findOne(email);
    if (existingUserByEmail) {
      throw new ConflictException('Email already registered');
    }

    // Check if student_id already exists
    const existingUserByStudentId = await this.usersService.findByStudentId(student_id);
    if (existingUserByStudentId) {
      throw new ConflictException('Student ID already registered');
    }

    // Hash password with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (password is already hashed)
    await this.usersService.create(email, hashedPassword, student_id, name);

    return { message: 'Registration successful' };
  }

  /**
   * Login with email and password
   * @param email - User's email
   * @param password - User's password
   * @returns JWT token and user info
   */
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    // Find user by email
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is banned
    if (user.banned) {
      throw new UnauthorizedException('Your account has been banned');
    }

    // Compare password with hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token (24-hour expiry configured in auth.module.ts)
    const payload = {
      email: user.email,
      sub: user.id,
      student_id: user.student_id,
      role: user.role || 'user', // Include role in token
    };
    const token = this.jwtService.sign(payload);

    // Return token + user info (without password)
    const { password: _, ...userInfo } = user;
    return {
      token,
      user: userInfo,
    };
  }

  /**
   * Validate JWT token and return user data
   * @param token - JWT token string
   * @returns User data if token is valid
   */
  async validateToken(token: string): Promise<any> {
    try {
      // Verify JWT signature
      const decoded = this.jwtService.verify(token);
      
      // Get user data
      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Return user data (without password)
      const { password: _, ...userInfo } = user;
      return userInfo;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Validate user credentials (used by LocalStrategy)
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}

