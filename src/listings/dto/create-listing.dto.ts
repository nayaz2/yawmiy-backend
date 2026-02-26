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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ListingCategory, ListingCondition } from '../listing.entity';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class CreateListingDto {
  @ApiProperty({
    description: 'Listing title',
    example: 'Calculus Textbook - 3rd Edition',
    maxLength: 100,
  })
  @Sanitize()
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(100, { message: 'Title must be at most 100 characters' })
  title: string;

  @ApiProperty({
    description: 'Product category',
    enum: ListingCategory,
    example: ListingCategory.TEXTBOOKS,
  })
  @IsEnum(ListingCategory, { message: 'Invalid category' })
  @IsNotEmpty({ message: 'Category is required' })
  category: ListingCategory;

  @ApiProperty({
    description: 'Price in paise (100 paise = ₹1)',
    example: 1000,
    minimum: 1,
  })
  @IsInt({ message: 'Price must be an integer (in paise)' })
  @Min(1, { message: 'Price must be at least 1 paise' })
  @IsNotEmpty({ message: 'Price is required' })
  price: number; // Stored in paise

  @ApiProperty({
    description: 'Product condition',
    enum: ListingCondition,
    example: ListingCondition.GOOD,
  })
  @IsEnum(ListingCondition, { message: 'Invalid condition' })
  @IsNotEmpty({ message: 'Condition is required' })
  condition: ListingCondition;

  @ApiProperty({
    description: 'Product description',
    example: 'Used calculus textbook in good condition. No highlights or notes.',
    maxLength: 500,
  })
  @Sanitize()
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MaxLength(500, { message: 'Description must be at most 500 characters' })
  description: string;

  @ApiPropertyOptional({
    description: 'Array of photo URLs',
    example: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @ApiProperty({
    description: 'Location where item is available',
    example: 'Main Campus - Library',
  })
  @Sanitize()
  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;
}

