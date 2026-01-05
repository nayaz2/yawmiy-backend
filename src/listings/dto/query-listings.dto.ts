import { IsEnum, IsInt, IsOptional, Min, IsString, IsArray, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ListingCategory, ListingCondition } from '../listing.entity';

export enum SortOption {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  DATE_DESC = 'date_desc',
  DATE_ASC = 'date_asc',
  RELEVANCE = 'relevance', // For search results
}

export class QueryListingsDto {
  // Text search
  @IsString()
  @IsOptional()
  search?: string; // Search in title and description

  // Category filtering
  @IsEnum(ListingCategory)
  @IsOptional()
  category?: ListingCategory;

  @IsArray()
  @IsEnum(ListingCategory, { each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }
    return value;
  })
  categories?: ListingCategory[]; // Multiple categories (comma-separated string or array)

  // Price range
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

  // Condition filter
  @IsEnum(ListingCondition)
  @IsOptional()
  condition?: ListingCondition;

  @IsArray()
  @IsEnum(ListingCondition, { each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }
    return value;
  })
  conditions?: ListingCondition[]; // Multiple conditions (comma-separated string or array)

  // Location filter
  @IsString()
  @IsOptional()
  location?: string; // Filter by location (exact match or contains)

  // Sorting
  @IsEnum(SortOption)
  @IsOptional()
  sort?: SortOption;

  // Pagination
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20; // Default 20 items per page
}

