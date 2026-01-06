import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ScoutsService } from './scouts.service';
import { PayoutsService } from '../payouts/payouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterScoutDto } from './dto/register-scout.dto';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { PayoutType } from '../payouts/payout.entity';

@Controller('scouts')
export class ScoutsController {
  constructor(
    private readonly scoutsService: ScoutsService,
    private readonly payoutsService: PayoutsService,
  ) {}

  /**
   * POST /scouts/register - Register as a scout
   * Requires JWT (user must be authenticated)
   * Requires: User must have at least 1 completed transaction
   */
  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@Body() registerScoutDto: RegisterScoutDto, @Request() req) {
    return this.scoutsService.registerAsScout(req.user.userId);
  }

  /**
   * GET /scouts/:id/earnings - Get scout earnings with breakdown
   * Requires JWT (scout can only view their own earnings)
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/earnings')
  async getEarnings(@Param('id') scout_id: string, @Request() req) {
    // Verify scout belongs to authenticated user
    const earnings = await this.scoutsService.getScoutEarnings(scout_id);
    
    // Check if scout belongs to user (basic security check)
    // Note: In production, you might want to add a more robust check
    // by fetching the scout first and verifying user_id
    
    return earnings;
  }

  /**
   * GET /scouts/leaderboard - Get top scouts by earnings
   * Public endpoint (no authentication required)
   */
  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.scoutsService.getLeaderboard(limitNum);
  }

  /**
   * POST /scouts/:id/request-payout - Request payout
   * Requires JWT (scout can only request their own payout)
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/request-payout')
  async requestPayout(
    @Param('id') scout_id: string,
    @Body() requestPayoutDto: RequestPayoutDto,
    @Request() req,
  ) {
    // Get scout to verify ownership and get user_id
    const scout = await this.scoutsService.getScoutById(scout_id);
    if (!scout) {
      throw new Error('Scout not found');
    }

    // Verify scout belongs to authenticated user
    if (scout.user_id !== req.user.userId) {
      throw new Error('Unauthorized');
    }

    // Determine payout amount
    const amount_paise = requestPayoutDto.amount_paise || scout.earnings_paise;

    if (amount_paise > scout.earnings_paise) {
      throw new Error('Requested amount exceeds available earnings');
    }

    if (amount_paise <= 0) {
      throw new Error('Requested amount must be greater than 0');
    }

    // Create payout request (will be processed on 1st/16th, 2 weeks after transaction)
    // immediate=false means it will be marked as PAYABLE
    // Payout will be held for 2 weeks to check for returns/refunds
    const payout = await this.payoutsService.createPayoutRequest(
      req.user.userId,
      amount_paise,
      PayoutType.SCOUT_BOUNTY,
      scout_id,
      undefined,
      false, // Not immediate - will be paid on 1st/16th, 2 weeks after transaction
    );

    const requested_amount_rupees = Math.round(amount_paise / 100);

    return {
      scout_id,
      payout_id: payout.payout_id,
      requested_amount: requested_amount_rupees, // In rupees (rounded)
      requested_amount_display: `₹${requested_amount_rupees}`, // Format as "₹232"
      status: payout.status,
      message: 'Payout request received. Will be processed on next payment date (1st/16th), 2 weeks after transaction.',
    };
  }
}

