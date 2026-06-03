import { Module, forwardRef } from '@nestjs/common';
import { GeoService } from './geo.service';
import { GeoController } from './geo.controller';
import { GeoGateway } from './geo.gateway';
import { DriverLocationRepository } from './driver-location.repository';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => NotificationsModule)],
  controllers: [GeoController],
  providers: [GeoService, GeoGateway, DriverLocationRepository],
  exports: [GeoService, DriverLocationRepository],
})
export class GeoModule {}
