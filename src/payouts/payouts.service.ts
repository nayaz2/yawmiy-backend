import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Payout, PayoutType, PayoutStatus } from './payout.entity';
import { User } from '../users/user.entity';
import { Scout } from '../scouts/scout.entity';
import { Order } from '../orders/order.entity';

@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);

  constructor(
    @InjectRepository(Payout)
    private payoutsRepository: Repository<Payout>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Scout)
    private scoutsRepository: Repository<Scout>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  /**
   * Create a payout request
   * For scout bounties and seller payouts, status is set to PAYABLE
   * Payouts are held for 2 weeks to check for returns/refunds
   * Will be processed on 1st or 16th, 2 weeks after transaction
   */
  async createPayoutRequest(
    user_id: number,
    amount_paise: number,
    payout_type: PayoutType,
    scout_id?: string,
    order_id?: string,
    immediate: boolean = false, // If true, process immediately; if false, mark as payable
  ): Promise<Payout> {
    // Verify user exists
    const user = await this.usersRepository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (amount_paise <= 0) {
      throw new BadRequestException('Payout amount must be greater than 0');
    }

    // Verify scout if provided
    if (scout_id) {
      const scout = await this.scoutsRepository.findOne({
        where: { scout_id },
      });
      if (!scout) {
        throw new NotFoundException('Scout not found');
      }
      if (scout.user_id !== user_id) {
        throw new BadRequestException('Scout does not belong to user');
      }
    }

    // Verify order if provided
    if (order_id) {
      const order = await this.ordersRepository.findOne({
        where: { order_id: order_id },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
    }

    // For automatic payouts (scout bounties, seller payouts), mark as PAYABLE
    // For manual requests, mark as PENDING
    const status = immediate ? PayoutStatus.PENDING : PayoutStatus.PAYABLE;

    const payout = this.payoutsRepository.create({
      user_id,
      amount_paise,
      payout_type,
      scout_id,
      order_id,
      status,
    });

    return this.payoutsRepository.save(payout);
  }

  /**
   * Process a single payout (internal method)
   * This simulates payment processing - in production, integrate with payment gateway
   */
  private async processPayoutInternal(payout: Payout): Promise<Payout> {
    try {
      // TODO: Integrate with actual payment gateway (PhonePe, Razorpay, etc.)
      // For now, simulate payment processing
      const paymentSuccess = await this.simulatePayment(payout);

      if (paymentSuccess) {
        payout.status = PayoutStatus.COMPLETED;
        payout.completed_at = new Date();
        payout.payment_reference = `PAY-${Date.now()}-${payout.payout_id.substring(0, 8)}`;

        // Deduct from scout earnings if it's a scout payout
        if (payout.payout_type === PayoutType.SCOUT_BOUNTY && payout.scout_id) {
          const scout = await this.scoutsRepository.findOne({
            where: { scout_id: payout.scout_id },
          });
          if (scout) {
            scout.earnings_paise = Math.max(
              0,
              scout.earnings_paise - payout.amount_paise,
            );
            await this.scoutsRepository.save(scout);
          }
        }

        this.logger.log(
          `✅ Payout ${payout.payout_id} completed: ₹${Math.round(payout.amount_paise / 100)} to user ${payout.user_id}`,
        );
      } else {
        payout.status = PayoutStatus.FAILED;
        payout.failure_reason = 'Payment processing failed';
        this.logger.error(`❌ Payout ${payout.payout_id} failed`);
      }
    } catch (error) {
      payout.status = PayoutStatus.FAILED;
      payout.failure_reason = error.message || 'Unknown error';
      this.logger.error(`❌ Payout ${payout.payout_id} error: ${error.message}`);
    }

    return this.payoutsRepository.save(payout);
  }

  /**
   * Process a single payout (public method for admin)
   * This simulates payment processing - in production, integrate with payment gateway
   */
  async processPayout(payout_id: string): Promise<Payout> {
    const payout = await this.payoutsRepository.findOne({
      where: { payout_id },
      relations: ['user', 'scout', 'order'],
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (payout.status !== PayoutStatus.PAYABLE) {
      throw new BadRequestException(
        `Payout is not in payable status. Current status: ${payout.status}`,
      );
    }

    // Check if order is refunded
    if (payout.order_id) {
      const order = await this.ordersRepository.findOne({
        where: { order_id: payout.order_id },
      });
      if (order && order.status === 'refunded') {
        throw new BadRequestException('Cannot process payout for refunded order');
      }
    }

    // Update status to processing
    payout.status = PayoutStatus.PROCESSING;
    payout.processed_at = new Date();
    await this.payoutsRepository.save(payout);

    // Process the payout
    return this.processPayoutInternal(payout);
  }

  /**
   * Simulate payment processing
   * In production, replace with actual payment gateway integration
   */
  private async simulatePayment(payout: Payout): Promise<boolean> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate 95% success rate (for testing)
    // In production, this would be actual payment gateway response
    const success = Math.random() > 0.05;

    if (!success) {
      this.logger.warn(
        `Payment simulation failed for payout ${payout.payout_id}`,
      );
    }

    return success;
  }

  /**
   * Automated payout processing (runs on 1st and 16th of every month)
   * Processes payable payouts that are at least 2 weeks old
   * Payment schedule:
   * - Transactions 1st-15th of month → Paid on 1st of next month (2 weeks after)
   * - Transactions 16th-31st of month → Paid on 16th of next month (2 weeks after)
   * 
   * Example:
   * - Transaction on Jan 5 → Paid on Feb 1
   * - Transaction on Jan 20 → Paid on Feb 16
   */
  @Cron('0 0 1,16 * *') // Run on 1st and 16th of every month at midnight
  async processPayablePayouts() {
    this.logger.log('🔄 Starting consolidated payout processing (1st/16th)...');

    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days ago

    // Get all payable payouts that are at least 2 weeks old
    // Also check that associated orders are not refunded
    const payablePayouts = await this.payoutsRepository
      .createQueryBuilder('payout')
      .leftJoinAndSelect('payout.order', 'order')
      .where('payout.status = :status', { status: PayoutStatus.PAYABLE })
      .andWhere('payout.created_at <= :twoWeeksAgo', { twoWeeksAgo })
      .orderBy('payout.created_at', 'ASC')
      .getMany();

    // Filter out payouts where order is refunded
    const validPayouts = payablePayouts.filter((payout) => {
      if (payout.order_id && payout.order) {
        // If order exists and is refunded, skip this payout
        if (payout.order.status === 'refunded') {
          this.logger.warn(
            `⏭️  Skipping payout ${payout.payout_id} - order ${payout.order_id} is refunded`,
          );
          return false;
        }
      }
      return true;
    });

    if (validPayouts.length === 0) {
      this.logger.log('✅ No payable payouts to process (after 2-week hold and refund check)');
      return;
    }

    this.logger.log(`📋 Found ${validPayouts.length} payable payouts (2+ weeks old, no refunds)`);

    // Group payouts by user to consolidate
    const payoutsByUser = new Map<number, Payout[]>();
    for (const payout of validPayouts) {
      if (!payoutsByUser.has(payout.user_id)) {
        payoutsByUser.set(payout.user_id, []);
      }
      payoutsByUser.get(payout.user_id)!.push(payout);
    }

    this.logger.log(`👥 Processing payouts for ${payoutsByUser.size} users`);

    // Process payouts for each user
    for (const [user_id, payouts] of payoutsByUser.entries()) {
      const totalAmount = payouts.reduce((sum, p) => sum + p.amount_paise, 0);
      const totalAmountRupees = Math.round(totalAmount / 100);
      this.logger.log(
        `💰 User ${user_id}: ${payouts.length} payouts, Total: ₹${totalAmountRupees}`,
      );

      // Process each payout for this user
      for (const payout of payouts) {
        try {
          // Double-check order is not refunded before processing
          if (payout.order_id) {
            const order = await this.ordersRepository.findOne({
              where: { order_id: payout.order_id },
            });
            if (order && order.status === 'refunded') {
              this.logger.warn(
                `⏭️  Skipping payout ${payout.payout_id} - order was refunded`,
              );
              // Mark payout as cancelled
              payout.status = PayoutStatus.CANCELLED;
              await this.payoutsRepository.save(payout);
              continue;
            }
          }

          // Update status to processing (skip pending for user-facing status)
          payout.status = PayoutStatus.PROCESSING;
          payout.processed_at = new Date();
          await this.payoutsRepository.save(payout);

          // Process the payout
          await this.processPayoutInternal(payout);
          // Add small delay between payouts
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          this.logger.error(
            `Error processing payout ${payout.payout_id}: ${error.message}`,
          );
        }
      }
    }

    this.logger.log('✅ Consolidated payout processing completed');
  }

  /**
   * Process pending payouts (for manual/admin-triggered payouts)
   * This processes payouts that are in PENDING status (not PAYABLE)
   */
  async processPendingPayouts() {
    this.logger.log('🔄 Starting pending payout processing...');

    // Get all pending payouts (manual requests)
    const pendingPayouts = await this.payoutsRepository.find({
      where: { status: PayoutStatus.PENDING },
      order: { created_at: 'ASC' },
      take: 10, // Process 10 at a time
    });

    if (pendingPayouts.length === 0) {
      this.logger.log('✅ No pending payouts to process');
      return;
    }

    this.logger.log(`📋 Found ${pendingPayouts.length} pending payouts`);

    // Process each payout
    for (const payout of pendingPayouts) {
      try {
        await this.processPayout(payout.payout_id);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        this.logger.error(
          `Error processing payout ${payout.payout_id}: ${error.message}`,
        );
      }
    }

    this.logger.log('✅ Pending payout processing completed');
  }

  /**
   * Get user's payout history
   */
  async getUserPayouts(
    user_id: number,
    limit: number = 20,
  ): Promise<{
    payouts: Payout[];
    total: number;
    total_paid_paise: number;
    payable_paise: number; // Amount ready to be paid (on next payment date)
    pending_paise: number; // Amount being processed
  }> {
    const [payouts, total] = await this.payoutsRepository.findAndCount({
      where: { user_id },
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['scout', 'order'],
    });

    // Calculate totals
    const completedPayouts = await this.payoutsRepository.find({
      where: {
        user_id,
        status: PayoutStatus.COMPLETED,
      },
    });

    const payablePayouts = await this.payoutsRepository.find({
      where: {
        user_id,
        status: PayoutStatus.PAYABLE,
      },
    });

    const pendingPayouts = await this.payoutsRepository.find({
      where: {
        user_id,
        status: PayoutStatus.PENDING,
      },
    });

    const total_paid_paise = completedPayouts.reduce(
      (sum, p) => sum + p.amount_paise,
      0,
    );
    const payable_paise = payablePayouts.reduce(
      (sum, p) => sum + p.amount_paise,
      0,
    );
    const pending_paise = pendingPayouts.reduce(
      (sum, p) => sum + p.amount_paise,
      0,
    );

    return {
      payouts,
      total,
      total_paid_paise,
      payable_paise,
      pending_paise,
    };
  }

  /**
   * Get all payouts (admin view)
   */
  async getAllPayouts(
    status?: PayoutStatus,
    limit: number = 50,
    page: number = 1,
  ): Promise<{
    payouts: Payout[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary?: {
      payable_paise: number;
      pending_paise: number;
      completed_paise: number;
      failed_paise: number;
    };
  }> {
    const queryBuilder = this.payoutsRepository.createQueryBuilder('payout');

    if (status) {
      queryBuilder.where('payout.status = :status', { status });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('payout.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .leftJoinAndSelect('payout.user', 'user')
      .leftJoinAndSelect('payout.scout', 'scout')
      .leftJoinAndSelect('payout.order', 'order');

    const payouts = await queryBuilder.getMany();

    // Calculate summary if no status filter (in rounded rupees)
    let summary;
    if (!status) {
      const allPayouts = await this.payoutsRepository.find();
      summary = {
        payable: Math.round(
          allPayouts
            .filter((p) => p.status === PayoutStatus.PAYABLE)
            .reduce((sum, p) => sum + p.amount_paise, 0) / 100,
        ),
        payable_display: `₹${Math.round(
          allPayouts
            .filter((p) => p.status === PayoutStatus.PAYABLE)
            .reduce((sum, p) => sum + p.amount_paise, 0) / 100,
        )}`,
        processing: Math.round(
          allPayouts
            .filter((p) => p.status === PayoutStatus.PROCESSING)
            .reduce((sum, p) => sum + p.amount_paise, 0) / 100,
        ),
        processing_display: `₹${Math.round(
          allPayouts
            .filter((p) => p.status === PayoutStatus.PROCESSING)
            .reduce((sum, p) => sum + p.amount_paise, 0) / 100,
        )}`,
        completed: Math.round(
          allPayouts
            .filter((p) => p.status === PayoutStatus.COMPLETED)
            .reduce((sum, p) => sum + p.amount_paise, 0) / 100,
        ),
        completed_display: `₹${Math.round(
          allPayouts
            .filter((p) => p.status === PayoutStatus.COMPLETED)
            .reduce((sum, p) => sum + p.amount_paise, 0) / 100,
        )}`,
        failed: Math.round(
          allPayouts
            .filter((p) => p.status === PayoutStatus.FAILED)
            .reduce((sum, p) => sum + p.amount_paise, 0) / 100,
        ),
        failed_display: `₹${Math.round(
          allPayouts
            .filter((p) => p.status === PayoutStatus.FAILED)
            .reduce((sum, p) => sum + p.amount_paise, 0) / 100,
        )}`,
      };
    }

    return {
      payouts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary,
    };
  }

  /**
   * Retry failed payout
   */
  async retryPayout(payout_id: string): Promise<Payout> {
    const payout = await this.payoutsRepository.findOne({
      where: { payout_id },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (payout.status !== PayoutStatus.FAILED) {
      throw new BadRequestException(
        'Can only retry failed payouts. Current status: ' + payout.status,
      );
    }

    // Reset to pending for retry
    payout.status = PayoutStatus.PENDING;
    payout.failure_reason = null;
    payout.processed_at = null;
    payout.completed_at = null;

    return this.payoutsRepository.save(payout);
  }

  /**
   * Cancel payout (admin only)
   */
  async cancelPayout(payout_id: string): Promise<Payout> {
    const payout = await this.payoutsRepository.findOne({
      where: { payout_id },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (payout.status === PayoutStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed payout');
    }

    payout.status = PayoutStatus.CANCELLED;
    return this.payoutsRepository.save(payout);
  }

  /**
   * Get next payment date (1st or 16th of current/next month)
   */
  getNextPaymentDate(): Date {
    const now = new Date();
    const day = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let nextPaymentDate: Date;

    if (day < 1) {
      // Before 1st, next payment is 1st of current month
      nextPaymentDate = new Date(currentYear, currentMonth, 1);
    } else if (day < 16) {
      // Between 1st and 16th, next payment is 16th of current month
      nextPaymentDate = new Date(currentYear, currentMonth, 16);
    } else {
      // After 16th, next payment is 1st of next month
      nextPaymentDate = new Date(currentYear, currentMonth + 1, 1);
    }

    return nextPaymentDate;
  }
}

