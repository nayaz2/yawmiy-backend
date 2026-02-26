import { IsEnum, IsInt, IsOptional, Min, IsString, IsArray, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListingCategory, ListingCondition } from '../listing.entity';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export enum SortOption {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  DATE_DESC = 'date_desc',
  DATE_ASC = 'date_asc',
  RELEVANCE = 'relevance', // For search results
}

export class QueryListingsDto {
  @ApiPropertyOptional({
    description: 'Text search in title and description',
    example: 'textbook',
  })
  @Sanitize()
  @IsString()
  @IsOptional()
  search?: string; // Search in title and description

  @ApiPropertyOptional({
    description: 'Filter by single category',
    enum: ListingCategory,
  })
  @IsEnum(ListingCategory)
  @IsOptional()
  category?: ListingCategory;

  @ApiPropertyOptional({
    description: 'Filter by multiple categories (comma-separated or array)',
    type: [String],
    enum: ListingCategory,
  })
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

  @ApiPropertyOptional({
    description: 'Minimum price in paise',
    example: 1000,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  price_min?: number; // In paise

  @ApiPropertyOptional({
    description: 'Maximum price in paise',
    example: 5000,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  price_max?: number; // In paise

  @ApiPropertyOptional({
    description: 'Filter by single condition',
    enum: ListingCondition,
  })
  @IsEnum(ListingCondition)
  @IsOptional()
  condition?: ListingCondition;

  @ApiPropertyOptional({
    description: 'Filter by multiple conditions (comma-separated or array)',
    type: [String],
    enum: ListingCondition,
  })
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

  @ApiPropertyOptional({
    description: 'Filter by location (partial match)',
    example: 'Main Campus',
  })
  @IsString()
  @IsOptional()
  location?: string; // Filter by location (exact match or contains)

  @ApiPropertyOptional({
    description: 'Sort option',
    enum: SortOption,
    example: SortOption.PRICE_ASC,
  })
  @IsEnum(SortOption)
  @IsOptional()
  sort?: SortOption;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20; // Default 20 items per page
}

