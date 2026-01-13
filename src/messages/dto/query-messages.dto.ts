import { IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMessagesDto {
  @IsOptional()
  @IsUUID()
  listing_id?: string; // Filter by listing

  @IsOptional()
  @IsUUID()
  order_id?: string; // Filter by order

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 50; // Default 50 messages per page
}





