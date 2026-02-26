import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Listing UUID to create order for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Listing ID is required' })
  listing_id: string;

  @ApiProperty({
    description: 'Meeting location for item exchange',
    example: 'Main Campus - Library Entrance',
  })
  @Sanitize()
  @IsString()
  @IsNotEmpty({ message: 'Meeting location is required' })
  meeting_location: string;
}

