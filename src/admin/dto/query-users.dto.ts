import { IsOptional, IsInt, Min, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryUsersDto {
  @IsOptional()
  @IsString()
  search?: string; // Search in name or email

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  banned?: boolean; // Filter by banned status

  @IsOptional()
  @IsString()
  role?: 'user' | 'admin'; // Filter by role

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20; // Default 20 users per page
}





