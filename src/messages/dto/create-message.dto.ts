import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Recipient user ID',
    example: '1',
  })
  @IsNotEmpty({ message: 'Recipient ID is required' })
  @IsString()
  recipient_id: string; // Will be converted to number

  @ApiProperty({
    description: 'Message content',
    example: 'Hello! Is this item still available?',
    maxLength: 2000,
  })
  @Sanitize()
  @IsString()
  @IsNotEmpty({ message: 'Message content is required' })
  @MaxLength(2000, { message: 'Message cannot exceed 2000 characters' })
  content: string;

  @ApiPropertyOptional({
    description: 'Optional: Listing UUID to link message to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  listing_id?: string; // Optional: Link to listing

  @ApiPropertyOptional({
    description: 'Optional: Order UUID to link message to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  order_id?: string; // Optional: Link to order
}





