import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RideService } from './ride.service';
import { RideController } from './ride.controller';
import { RideGateway } from './ride.gateway';
import { RideRepository } from './ride.repository';
import { DriverOfferRepository } from './driver-offer.repository';
import { Ride } from './entities/ride.entity';
import { DriverOffer } from './entities/driver-offer.entity';
import { GeoModule } from '../geo/geo.module';
import { RoutingModule } from '../routing/routing.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DriverModule } from '../driver/driver.module';
import { CancellationModule } from '../cancellation/cancellation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ride, DriverOffer]),
    forwardRef(() => GeoModule),
    RoutingModule,
    forwardRef(() => NotificationsModule),
    DriverModule,
    CancellationModule,
  ],
  controllers: [RideController],
  providers: [RideService, RideGateway, RideRepository, DriverOfferRepository],
  exports: [RideService, RideGateway, RideRepository],
})
export class RideModule {}
