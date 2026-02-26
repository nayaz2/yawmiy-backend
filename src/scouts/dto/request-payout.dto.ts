import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RequestPayoutDto {
  @ApiPropertyOptional({
    description: 'Payout amount in paise. If not provided, all available earnings will be requested.',
    example: 10000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Amount must be positive' })
  amount_paise?: number; // Optional: specific amount, otherwise all earnings
}

