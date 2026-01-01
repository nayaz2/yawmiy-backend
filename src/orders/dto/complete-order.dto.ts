import { IsOptional, IsDateString } from 'class-validator';

export class CompleteOrderDto {
  @IsOptional()
  @IsDateString()
  meeting_time?: string;
}

