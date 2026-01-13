import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { PayoutsService } from './payouts.service';
import { PayoutsController } from './payouts.controller';
import { Payout } from './payout.entity';
import { User } from '../users/user.entity';
import { Scout } from '../scouts/scout.entity';
import { Order } from '../orders/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payout, User, Scout, Order]),
    ScheduleModule.forRoot(), // Enable cron jobs
  ],
  controllers: [PayoutsController],
  providers: [PayoutsService],
  exports: [PayoutsService], // Export for use in other modules
})
export class PayoutsModule {}





