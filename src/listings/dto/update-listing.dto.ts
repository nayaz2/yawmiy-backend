import {
  IsString,
  IsEnum,
  IsInt,
  IsArray,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { ListingCategory, ListingCondition, ListingStatus } from '../listing.entity';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class UpdateListingDto {
  @Sanitize()
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Title must be at most 100 characters' })
  title?: string;

  @IsEnum(ListingCategory, { message: 'Invalid category' })
  @IsOptional()
  category?: ListingCategory;

  @IsInt({ message: 'Price must be an integer (in paise)' })
  @Min(1, { message: 'Price must be at least 1 paise' })
  @IsOptional()
  price?: number; // Stored in paise

  @IsEnum(ListingCondition, { message: 'Invalid condition' })
  @IsOptional()
  condition?: ListingCondition;

  @Sanitize()
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must be at most 500 characters' })
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @Sanitize()
  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(ListingStatus, { message: 'Invalid status' })
  @IsOptional()
  status?: ListingStatus;
}

