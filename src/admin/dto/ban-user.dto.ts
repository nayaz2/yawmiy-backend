import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class BanUserDto {
  @ApiProperty({
    description: 'Reason for banning the user',
    example: 'Violation of terms of service',
    maxLength: 500,
  })
  @Sanitize()
  @IsString()
  @IsNotEmpty({ message: 'Reason is required' })
  @MaxLength(500, { message: 'Reason cannot exceed 500 characters' })
  reason: string;
}





