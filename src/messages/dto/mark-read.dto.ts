import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiProperty({
    description: 'Array of message UUIDs to mark as read',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsArray({ message: 'message_ids must be an array' })
  @ArrayMinSize(1, { message: 'At least one message ID is required' })
  @IsUUID('4', { each: true, message: 'Each message_id must be a valid UUID' })
  @Type(() => String)
  message_ids: string[];
}





