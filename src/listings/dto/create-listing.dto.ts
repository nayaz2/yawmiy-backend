import {
  IsString,
  IsEnum,
  IsInt,
  IsArray,
  IsOptional,
  MaxLength,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ListingCategory, ListingCondition } from '../listing.entity';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(100, { message: 'Title must be at most 100 characters' })
  title: string;

  @IsEnum(ListingCategory, { message: 'Invalid category' })
  @IsNotEmpty({ message: 'Category is required' })
  category: ListingCategory;

  @IsInt({ message: 'Price must be an integer (in paise)' })
  @Min(1, { message: 'Price must be at least 1 paise' })
  @IsNotEmpty({ message: 'Price is required' })
  price: number; // Stored in paise

  @IsEnum(ListingCondition, { message: 'Invalid condition' })
  @IsNotEmpty({ message: 'Condition is required' })
  condition: ListingCondition;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MaxLength(500, { message: 'Description must be at most 500 characters' })
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;
}

