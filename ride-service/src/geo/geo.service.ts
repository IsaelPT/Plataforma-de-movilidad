import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DriverLocationRepository } from './driver-location.repository';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);
  private readonly searchRadiusMeters: number;

  constructor(
    private driverLocationRepository: DriverLocationRepository,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {
    this.searchRadiusMeters = this.configService.get<number>('ride.searchRadiusMeters') || 5000;
  }

  async findNearbyDrivers(lat: number, lng: number, radius?: number): Promise<any[]> {
    const effectiveRadius = radius || this.searchRadiusMeters;
    return this.driverLocationRepository.findNearbyDrivers(lat, lng, effectiveRadius);
  }

  async updateDriverLocation(driverId: string, lat: number, lng: number): Promise<void> {
    await this.driverLocationRepository.updateLocation(driverId, lat, lng);
  }

  async getDriverLocation(driverId: string) {
    return this.driverLocationRepository.getLocation(driverId);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async broadcastDriverLocations() {
    try {
      const drivers = await this.driverLocationRepository.getAllDriverLocations();
      if (drivers.length > 0) {
        this.notificationsService.sendDriverLocationUpdate(drivers);
      }
    } catch (error) {
      this.logger.error(`Error broadcasting driver locations: ${error.message}`);
    }
  }
}
