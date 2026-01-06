import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';
import { PayoutStatus } from './payout.entity';

@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  /**
   * GET /payouts/my-payouts - Get current user's payout history
   * Returns payouts with rounded rupee amounts (not paise)
   * Status: PAYABLE → PROCESSING → COMPLETED (no PENDING shown)
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-payouts')
  async getMyPayouts(
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    return this.payoutsService.getUserPayouts(req.user.userId, limit || 20);
  }

  /**
   * POST /payouts/process/:id - Manually trigger payout processing (admin only)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('process/:id')
  async processPayout(@Param('id') payout_id: string) {
    return this.payoutsService.processPayout(payout_id);
  }

  /**
   * GET /payouts - Get all payouts (admin only)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async getAllPayouts(
    @Query('status') status?: PayoutStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.payoutsService.getAllPayouts(
      status,
      limit || 50,
      page || 1,
    );
  }

  /**
   * POST /payouts/:id/retry - Retry failed payout (admin only)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/retry')
  async retryPayout(@Param('id') payout_id: string) {
    return this.payoutsService.retryPayout(payout_id);
  }

  /**
   * POST /payouts/:id/cancel - Cancel payout (admin only)
   */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/cancel')
  async cancelPayout(@Param('id') payout_id: string) {
    return this.payoutsService.cancelPayout(payout_id);
  }
}

