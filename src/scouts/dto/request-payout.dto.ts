import { IsOptional, IsNumber, Min } from 'class-validator';

export class RequestPayoutDto {
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Amount must be positive' })
  amount_paise?: number; // Optional: specific amount, otherwise all earnings
}

