import {
  IsString,
  IsEnum,
  IsInt,
  IsArray,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListingCategory, ListingCondition, ListingStatus } from '../listing.entity';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class UpdateListingDto {
  @ApiPropertyOptional({
    description: 'Listing title',
    example: 'Calculus Textbook - 3rd Edition',
    maxLength: 100,
  })
  @Sanitize()
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Title must be at most 100 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Product category',
    enum: ListingCategory,
  })
  @IsEnum(ListingCategory, { message: 'Invalid category' })
  @IsOptional()
  category?: ListingCategory;

  @ApiPropertyOptional({
    description: 'Price in paise (100 paise = ₹1)',
    example: 1000,
    minimum: 1,
  })
  @IsInt({ message: 'Price must be an integer (in paise)' })
  @Min(1, { message: 'Price must be at least 1 paise' })
  @IsOptional()
  price?: number; // Stored in paise

  @ApiPropertyOptional({
    description: 'Product condition',
    enum: ListingCondition,
  })
  @IsEnum(ListingCondition, { message: 'Invalid condition' })
  @IsOptional()
  condition?: ListingCondition;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Used calculus textbook in good condition.',
    maxLength: 500,
  })
  @Sanitize()
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must be at most 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Array of photo URLs',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional({
    description: 'Location where item is available',
    example: 'Main Campus - Library',
  })
  @Sanitize()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Listing status',
    enum: ListingStatus,
  })
  @IsEnum(ListingStatus, { message: 'Invalid status' })
  @IsOptional()
  status?: ListingStatus;
}

