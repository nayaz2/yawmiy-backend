import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class BanUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Reason is required' })
  @MaxLength(500, { message: 'Reason cannot exceed 500 characters' })
  reason: string;
}

