import { IsOptional, IsInt, Min, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class QueryUsersDto {
  @ApiPropertyOptional({
    description: 'Search in user name or email',
    example: 'john',
  })
  @Sanitize()
  @IsOptional()
  @IsString()
  search?: string; // Search in name or email

  @ApiPropertyOptional({
    description: 'Filter by banned status',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  banned?: boolean; // Filter by banned status

  @ApiPropertyOptional({
    description: 'Filter by user role',
    enum: ['user', 'admin'],
    example: 'user',
  })
  @IsOptional()
  @IsString()
  role?: 'user' | 'admin'; // Filter by role

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Users per page',
    example: 20,
    minimum: 1,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20; // Default 20 users per page
}





