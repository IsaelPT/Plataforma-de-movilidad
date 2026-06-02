import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { RideGateway } from '../ride/ride.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(@Inject(forwardRef(() => RideGateway)) private readonly gateway: RideGateway) {}

  sendRideOffer(driverId: string, data: any) {
    this.gateway.sendToDriver(driverId, 'ride_offer', data);
  }

  sendRideAccepted(passengerId: string, data: any) {
    this.gateway.sendToPassenger(passengerId, 'ride_accepted', data);
  }

  sendStartNavigation(driverId: string, data: any) {
    this.gateway.sendToDriver(driverId, 'start_navigation', data);
  }

  sendRideCancelled(passengerId: string, data: any) {
    this.gateway.sendToPassenger(passengerId, 'ride_cancelled', data);
  }

  sendRideStatusChanged(userId: string, data: any) {
    this.gateway.sendToUser(userId, 'ride_status_changed', data);
  }

  sendDriverLocationUpdate(drivers: any[]) {
    this.gateway.sendToAll('driver_location_update', drivers);
  }

  sendSOSAlert(data: any) {
    this.gateway.sendToAll('sos_alert', data);
  }

  sendToPassenger(passengerId: string, event: string, data: any) {
    this.gateway.sendToPassenger(passengerId, event, data);
  }
}
