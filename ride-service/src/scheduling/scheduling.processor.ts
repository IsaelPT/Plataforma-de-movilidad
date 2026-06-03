import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SchedulingService } from './scheduling.service';
import { RideService } from '../ride/ride.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SchedulingProcessor {
  private readonly logger = new Logger(SchedulingProcessor.name);

  constructor(
    private readonly schedulingService: SchedulingService,
    private readonly rideService: RideService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledRides() {
    this.logger.log('Checking pending scheduled rides...');

    try {
      const pending = await this.schedulingService.getPendingSearches();

      for (const schedule of pending) {
        this.logger.log(`Processing scheduled ride ${schedule.id}`);

        await this.schedulingService.markAsSearching(schedule.id);

        const ride = await this.rideService.requestRide(
          schedule.passenger_id,
          schedule.origin_lat,
          schedule.origin_lon,
          schedule.destination_lat,
          schedule.destination_lon,
          schedule.origin_address,
          schedule.destination_address,
        );

        await this.schedulingService.markAsCompleted(schedule.id, ride.id);

        this.notificationsService.sendToPassenger(schedule.passenger_id, 'scheduled_ride_processing', {
          scheduledRideId: schedule.id,
          rideId: ride.id,
          message: 'Tu viaje programado está siendo procesado',
        });
      }
    } catch (error) {
      this.logger.error(`Error processing scheduled rides: ${error.message}`);
    }
  }
}
