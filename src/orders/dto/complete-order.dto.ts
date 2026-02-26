import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteOrderDto {
  @ApiPropertyOptional({
    description: 'Meeting time when order was completed (ISO 8601 format)',
    example: '2024-01-15T14:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  meeting_time?: string;
}

