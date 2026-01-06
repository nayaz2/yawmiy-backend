import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { Listing } from '../listings/listing.entity';
import { ScoutsModule } from '../scouts/scouts.module';
import { PayoutsModule } from '../payouts/payouts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Listing]),
    forwardRef(() => ScoutsModule), // Use forwardRef to handle circular dependency
    PayoutsModule, // Import PayoutsModule to use PayoutsService
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

