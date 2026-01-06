import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoutsService } from './scouts.service';
import { ScoutsController } from './scouts.controller';
import { Scout } from './scout.entity';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { PayoutsModule } from '../payouts/payouts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scout, User, Order]),
    PayoutsModule, // Import PayoutsModule to use PayoutsService
  ],
  controllers: [ScoutsController],
  providers: [ScoutsService],
  exports: [ScoutsService], // Export for use in OrdersModule
})
export class ScoutsModule {}

