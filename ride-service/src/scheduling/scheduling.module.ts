import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';
import { SchedulingProcessor } from './scheduling.processor';
import { SchedulingRepository } from './scheduling.repository';
import { ScheduledRide } from './entities/scheduled-ride.entity';
import { RideModule } from '../ride/ride.module';
import { GeoModule } from '../geo/geo.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RoutingModule } from '../routing/routing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduledRide]),
    RideModule,
    GeoModule,
    RoutingModule,
    NotificationsModule,
  ],
  controllers: [SchedulingController],
  providers: [SchedulingService, SchedulingProcessor, SchedulingRepository],
  exports: [SchedulingService],
})
export class SchedulingModule {}
