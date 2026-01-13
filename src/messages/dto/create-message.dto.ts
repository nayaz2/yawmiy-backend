import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class CreateMessageDto {
  @IsNotEmpty({ message: 'Recipient ID is required' })
  @IsString()
  recipient_id: string; // Will be converted to number

  @Sanitize()
  @IsString()
  @IsNotEmpty({ message: 'Message content is required' })
  @MaxLength(2000, { message: 'Message cannot exceed 2000 characters' })
  content: string;

  @IsOptional()
  @IsUUID()
  listing_id?: string; // Optional: Link to listing

  @IsOptional()
  @IsUUID()
  order_id?: string; // Optional: Link to order
}





