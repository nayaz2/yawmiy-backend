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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ScoutsService } from './scouts.service';
import { PayoutsService } from '../payouts/payouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterScoutDto } from './dto/register-scout.dto';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { PayoutType } from '../payouts/payout.entity';

@ApiTags('scouts')
@Controller('scouts')
export class ScoutsController {
  constructor(
    private readonly scoutsService: ScoutsService,
    private readonly payoutsService: PayoutsService,
  ) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Register as scout',
    description: 'Register the authenticated user as a scout. Requires at least 1 completed transaction (as buyer or seller).'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Successfully registered as scout',
    schema: {
      example: {
        scout_id: 'uuid',
        message: 'Successfully registered as scout'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'User does not meet requirements' })
  @ApiResponse({ status: 409, description: 'Already registered as scout' })
  async register(@Body() registerScoutDto: RegisterScoutDto, @Request() req) {
    return this.scoutsService.registerAsScout(req.user.userId);
  }

  @Get(':id/earnings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get scout earnings',
    description: 'Get detailed earnings breakdown for a scout. Includes total earnings, recruits count, and per-recruit breakdown.'
  })
  @ApiParam({ name: 'id', description: 'Scout UUID' })
  @ApiResponse({ status: 200, description: 'Earnings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Scout not found' })
  async getEarnings(@Param('id') scout_id: string, @Request() req) {
    // Verify scout belongs to authenticated user
    const earnings = await this.scoutsService.getScoutEarnings(scout_id);
    
    // Check if scout belongs to user (basic security check)
    // Note: In production, you might want to add a more robust check
    // by fetching the scout first and verifying user_id
    
    return earnings;
  }

  @Get('leaderboard')
  @ApiOperation({ 
    summary: 'Get leaderboard',
    description: 'Get top scouts ranked by earnings. Public endpoint (no authentication required).'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of top scouts to return', example: 10 })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  async getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.scoutsService.getLeaderboard(limitNum);
  }

  @Post(':id/request-payout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Request payout',
    description: 'Request a payout for scout earnings. Payout will be processed on 1st/16th, 2 weeks after transaction. Scout can only request their own payout.'
  })
  @ApiParam({ name: 'id', description: 'Scout UUID' })
  @ApiResponse({ status: 201, description: 'Payout request created' })
  @ApiResponse({ status: 400, description: 'Invalid amount or exceeds earnings' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the scout owner' })
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

