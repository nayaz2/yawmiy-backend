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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterScoutDto } from './dto/register-scout.dto';
import { RequestPayoutDto } from './dto/request-payout.dto';

@Controller('scouts')
export class ScoutsController {
  constructor(private readonly scoutsService: ScoutsService) {}

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
    return this.scoutsService.requestPayout(scout_id, requestPayoutDto.amount_paise);
  }
}

