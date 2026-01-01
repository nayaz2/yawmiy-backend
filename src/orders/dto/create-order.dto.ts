import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Listing ID is required' })
  listing_id: string;

  @IsString()
  @IsNotEmpty({ message: 'Meeting location is required' })
  meeting_location: string;
}

