import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scout, ScoutStatus } from './scout.entity';
import { User } from '../users/user.entity';
import { Order, OrderStatus } from '../orders/order.entity';

@Injectable()
export class ScoutsService {
  constructor(
    @InjectRepository(Scout)
    private scoutsRepository: Repository<Scout>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  /**
   * 1. Register as Scout
   * Check user has 1+ transactions (completed orders as buyer or seller)
   * Create scout record
   * Return scout_id
   */
  async registerAsScout(user_id: number): Promise<{ scout_id: string; message: string }> {
    // Check if user already registered as scout
    const existingScout = await this.scoutsRepository.findOne({
      where: { user_id },
    });

    if (existingScout) {
      throw new ConflictException('User is already registered as a scout');
    }

    // Check if user has at least 1 completed transaction
    // Transaction = completed order where user is buyer OR seller
    const transactionCount = await this.ordersRepository.count({
      where: [
        { buyer_id: user_id, status: OrderStatus.COMPLETED },
        { seller_id: user_id, status: OrderStatus.COMPLETED },
      ],
    });

    if (transactionCount < 1) {
      throw new BadRequestException(
        'You need at least 1 completed transaction (as buyer or seller) to register as a scout',
      );
    }

    // Create scout record
    const scout = this.scoutsRepository.create({
      user_id,
      status: ScoutStatus.ACTIVE,
      recruits_count: 0,
      earnings_paise: 0,
    });

    const savedScout = await this.scoutsRepository.save(scout);

    return {
      scout_id: savedScout.scout_id,
      message: 'Successfully registered as scout',
    };
  }

  /**
   * 2. Get Scout Earnings
   * Calculate bounties (₹10 per first sale of recruit)
   * Return with breakdown
   */
  async getScoutEarnings(scout_id: string): Promise<{
    scout_id: string;
    total_earnings_paise: number;
    total_earnings_display: string;
    recruits_count: number;
    bounty_per_recruit_paise: number;
    bounty_per_recruit_display: string;
    breakdown: Array<{
      recruit_id: number;
      recruit_name: string;
      recruit_email: string;
      first_sale_amount_paise: number;
      first_sale_amount_display: string;
      bounty_earned_paise: number;
      bounty_earned_display: string;
    }>;
  }> {
    const scout = await this.scoutsRepository.findOne({
      where: { scout_id },
      relations: ['user'],
    });

    if (!scout) {
      throw new NotFoundException('Scout not found');
    }

    // Find all users recruited by this scout
    const recruits = await this.usersRepository.find({
      where: { recruiter_id: scout.user_id },
    });

    // Find first completed sale for each recruit (as seller)
    const breakdown: Array<{
      recruit_id: number;
      recruit_name: string;
      recruit_email: string;
      first_sale_amount_paise: number;
      first_sale_amount_display: string;
      bounty_earned_paise: number;
      bounty_earned_display: string;
    }> = [];
    const BOUNTY_PER_FIRST_SALE_PAISE = 1000; // ₹10

    for (const recruit of recruits) {
      // Find first completed order where recruit is seller
      const firstSale = await this.ordersRepository.findOne({
        where: {
          seller_id: recruit.id,
          status: OrderStatus.COMPLETED,
        },
        order: { completed_at: 'ASC' }, // First completed sale
      });

      if (firstSale) {
        breakdown.push({
          recruit_id: recruit.id,
          recruit_name: recruit.name,
          recruit_email: recruit.email,
          first_sale_amount_paise: firstSale.item_price_paise,
          first_sale_amount_display: `₹${(firstSale.item_price_paise / 100).toFixed(2)}`,
          bounty_earned_paise: BOUNTY_PER_FIRST_SALE_PAISE,
          bounty_earned_display: `₹${(BOUNTY_PER_FIRST_SALE_PAISE / 100).toFixed(2)}`,
        });
      }
    }

    // Total earnings = number of recruits with first sale * ₹10
    const total_earnings_paise = breakdown.length * BOUNTY_PER_FIRST_SALE_PAISE;

    return {
      scout_id: scout.scout_id,
      total_earnings_paise,
      total_earnings_display: `₹${(total_earnings_paise / 100).toFixed(2)}`,
      recruits_count: recruits.length,
      bounty_per_recruit_paise: BOUNTY_PER_FIRST_SALE_PAISE,
      bounty_per_recruit_display: `₹${(BOUNTY_PER_FIRST_SALE_PAISE / 100).toFixed(2)}`,
      breakdown,
    };
  }

  /**
   * 3. Trigger Bounty on First Sale
   * Check if seller has recruiter_id
   * If yes: add 1000 paise (₹10) bounty to recruiter
   * Notify recruiter (log for now)
   */
  async triggerBountyOnFirstSale(seller_id: number, amount_paise: number): Promise<void> {
    // Find seller
    const seller = await this.usersRepository.findOne({
      where: { id: seller_id },
    });

    if (!seller || !seller.recruiter_id) {
      // No recruiter, no bounty
      return;
    }

    // Check if this is the seller's first completed sale
    const completedSalesCount = await this.ordersRepository.count({
      where: {
        seller_id,
        status: OrderStatus.COMPLETED,
      },
    });

    // Only trigger bounty on first sale
    if (completedSalesCount !== 1) {
      return;
    }

    // Find scout record for recruiter
    const scout = await this.scoutsRepository.findOne({
      where: { user_id: seller.recruiter_id },
    });

    if (!scout) {
      // Recruiter is not a registered scout, no bounty
      return;
    }

    // Add bounty to scout earnings
    const BOUNTY_PAISE = 1000; // ₹10
    scout.earnings_paise += BOUNTY_PAISE;
    scout.recruits_count += 1;
    await this.scoutsRepository.save(scout);

    // Notify recruiter (log for now - can be enhanced with notifications)
    console.log(
      `💰 Bounty triggered! Scout ${scout.user_id} earned ₹${(BOUNTY_PAISE / 100).toFixed(2)} for recruit ${seller_id}'s first sale of ₹${(amount_paise / 100).toFixed(2)}`,
    );
  }

  /**
   * 4. Get Leaderboard
   * Top scouts by earnings
   * Return sorted list
   */
  async getLeaderboard(limit: number = 10): Promise<Array<{
    rank: number;
    scout_id: string;
    user_id: number;
    user_name: string;
    user_email: string;
    recruits_count: number;
    earnings_paise: number;
    earnings_display: string;
  }>> {
    const scouts = await this.scoutsRepository.find({
      where: { status: ScoutStatus.ACTIVE },
      relations: ['user'],
      order: { earnings_paise: 'DESC' },
      take: limit,
    });

    return scouts.map((scout, index) => ({
      rank: index + 1,
      scout_id: scout.scout_id,
      user_id: scout.user_id,
      user_name: scout.user.name,
      user_email: scout.user.email,
      recruits_count: scout.recruits_count,
      earnings_paise: scout.earnings_paise,
      earnings_display: `₹${(scout.earnings_paise / 100).toFixed(2)}`,
    }));
  }

  /**
   * Request Payout
   * Queue payout request (placeholder for now)
   */
  async requestPayout(scout_id: string, amount_paise?: number): Promise<{
    scout_id: string;
    requested_amount_paise: number;
    requested_amount_display: string;
    message: string;
  }> {
    const scout = await this.scoutsRepository.findOne({
      where: { scout_id },
    });

    if (!scout) {
      throw new NotFoundException('Scout not found');
    }

    // If no amount specified, request all earnings
    const requested_amount_paise = amount_paise || scout.earnings_paise;

    if (requested_amount_paise > scout.earnings_paise) {
      throw new BadRequestException('Requested amount exceeds available earnings');
    }

    if (requested_amount_paise <= 0) {
      throw new BadRequestException('Requested amount must be greater than 0');
    }

    // TODO: Queue payout request (implement payout queue system)
    // For now, just return the request details
    console.log(
      `💸 Payout requested: Scout ${scout_id} requested ₹${(requested_amount_paise / 100).toFixed(2)}`,
    );

    return {
      scout_id: scout.scout_id,
      requested_amount_paise,
      requested_amount_display: `₹${(requested_amount_paise / 100).toFixed(2)}`,
      message: 'Payout request received. Processing will begin shortly.',
    };
  }
}

