import { IsEmail, IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Matches(/\.(edu|ac)(\.in)?$/, { message: 'Email must end with .edu, .edu.in, .ac, or .ac.in' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least 1 uppercase letter, 1 number, and 1 special character',
  })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString()
  @Matches(/^\d{8,10}$/, { message: 'Student ID must be 8-10 digits' })
  @IsNotEmpty({ message: 'Student ID is required' })
  student_id: string;

  @Sanitize()
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;
}

