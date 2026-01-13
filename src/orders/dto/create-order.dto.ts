import { IsString, IsNotEmpty } from 'class-validator';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Listing ID is required' })
  listing_id: string;

  @Sanitize()
  @IsString()
  @IsNotEmpty({ message: 'Meeting location is required' })
  meeting_location: string;
}

