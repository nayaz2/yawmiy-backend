import { IsArray, IsUUID, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MarkReadDto {
  @IsArray({ message: 'message_ids must be an array' })
  @ArrayMinSize(1, { message: 'At least one message ID is required' })
  @IsUUID('4', { each: true, message: 'Each message_id must be a valid UUID' })
  @Type(() => String)
  message_ids: string[];
}

