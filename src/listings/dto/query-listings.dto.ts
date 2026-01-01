import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ListingCategory, ListingCondition } from '../listing.entity';

export enum SortOption {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  DATE_DESC = 'date_desc',
  DATE_ASC = 'date_asc',
}

export class QueryListingsDto {
  @IsEnum(ListingCategory)
  @IsOptional()
  category?: ListingCategory;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  price_min?: number; // In paise

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  price_max?: number; // In paise

  @IsEnum(ListingCondition)
  @IsOptional()
  condition?: ListingCondition;

  @IsEnum(SortOption)
  @IsOptional()
  sort?: SortOption;
}

