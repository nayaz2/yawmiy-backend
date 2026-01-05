import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
  exports: [AdminService, AdminGuard],
})
export class AdminModule {}

