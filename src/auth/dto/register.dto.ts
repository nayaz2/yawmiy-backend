import { IsEmail, IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address (must end with .edu, .edu.in, .ac, or .ac.in)',
    example: 'student@university.edu',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Matches(/\.(edu|ac)(\.in)?$/, { message: 'Email must end with .edu, .edu.in, .ac, or .ac.in' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password (min 8 chars, 1 uppercase, 1 number, 1 special character)',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least 1 uppercase letter, 1 number, and 1 special character',
  })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    description: 'Student ID (8-10 digits, locked after registration)',
    example: '12345678',
    pattern: '^\\d{8,10}$',
  })
  @IsString()
  @Matches(/^\d{8,10}$/, { message: 'Student ID must be 8-10 digits' })
  @IsNotEmpty({ message: 'Student ID is required' })
  student_id: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @Sanitize()
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;
}

