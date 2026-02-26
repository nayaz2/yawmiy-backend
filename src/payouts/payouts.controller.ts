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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';
import { PayoutStatus } from './payout.entity';

@ApiTags('payouts')
@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get('my-payouts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user payouts',
    description: 'Get payout history for the authenticated user. Amounts are displayed in rounded rupees.'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of payouts to return', example: 20 })
  @ApiResponse({ status: 200, description: 'Payouts retrieved successfully' })
  async getMyPayouts(
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    return this.payoutsService.getUserPayouts(req.user.userId, limit || 20);
  }

  @Post('process/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Process payout (Admin)',
    description: 'Manually trigger payout processing. Admin only.'
  })
  @ApiParam({ name: 'id', description: 'Payout UUID' })
  @ApiResponse({ status: 200, description: 'Payout processed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async processPayout(@Param('id') payout_id: string) {
    return this.payoutsService.processPayout(payout_id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get all payouts (Admin)',
    description: 'Get all payouts with optional filtering by status. Admin only.'
  })
  @ApiQuery({ name: 'status', required: false, enum: PayoutStatus, description: 'Filter by payout status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 50 })
  @ApiResponse({ status: 200, description: 'Payouts retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
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

  @Post(':id/retry')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Retry failed payout (Admin)',
    description: 'Retry processing a failed payout. Admin only.'
  })
  @ApiParam({ name: 'id', description: 'Payout UUID' })
  @ApiResponse({ status: 200, description: 'Payout retry initiated' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async retryPayout(@Param('id') payout_id: string) {
    return this.payoutsService.retryPayout(payout_id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cancel payout (Admin)',
    description: 'Cancel a payout. Admin only.'
  })
  @ApiParam({ name: 'id', description: 'Payout UUID' })
  @ApiResponse({ status: 200, description: 'Payout cancelled successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async cancelPayout(@Param('id') payout_id: string) {
    return this.payoutsService.cancelPayout(payout_id);
  }
}

