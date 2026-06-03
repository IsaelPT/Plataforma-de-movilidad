import { Injectable, Logger, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { RideRepository } from './ride.repository';
import { DriverOfferRepository } from './driver-offer.repository';
import { GeoService } from '../geo/geo.service';
import { RoutingService } from '../routing/routing.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CancellationRepository } from '../cancellation/cancellation.repository';
import { RideStateMachine } from './ride.state-machine';
import { RideStatus } from '../common/enums';

@Injectable()
export class RideService {
  private readonly logger = new Logger(RideService.name);
  private readonly offerTimeoutSeconds: number;
  private readonly activeOffers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private configService: ConfigService,
    private rideRepository: RideRepository,
    private driverOfferRepository: DriverOfferRepository,
    @Inject(forwardRef(() => GeoService)) private geoService: GeoService,
    private routingService: RoutingService,
    @Inject(forwardRef(() => NotificationsService)) private notificationsService: NotificationsService,
    private cancellationRepository: CancellationRepository,
  ) {
    this.offerTimeoutSeconds = this.configService.get<number>('ride.offerTimeoutSeconds') || 20;
  }

  async requestRide(
    passengerId: string,
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    originAddress?: string,
    destinationAddress?: string,
  ) {
    const rideId = uuidv4();
    const route = await this.routingService.calculateRoute(originLat, originLng, destLat, destLng);

    await this.rideRepository.create(
      rideId,
      passengerId,
      originLng,
      originLat,
      destLng,
      destLat,
      originAddress || null,
      destinationAddress || null,
      route.distanceKm,
      route.durationMin,
      route.polyline,
    );

    this.logger.log(`Ride ${rideId} created for passenger ${passengerId}`);

    const ride = await this.rideRepository.findById(rideId);

    this.startMatchmaking(rideId, originLat, originLng, passengerId);

    return ride;
  }

  private async startMatchmaking(rideId: string, lat: number, lng: number, passengerId: string) {
    try {
      const nearbyDrivers = await this.geoService.findNearbyDrivers(lat, lng);

      if (nearbyDrivers.length === 0) {
        this.notificationsService.sendToPassenger(passengerId, 'no_drivers_available', {
          rideId,
          message: 'No hay conductores disponibles en este momento.',
        });
        return;
      }

      await this.sendOfferToDrivers(rideId, nearbyDrivers, 0, passengerId);
    } catch (error) {
      this.logger.error(`Matchmaking failed for ride ${rideId}: ${error.message}`);
    }
  }

  private async sendOfferToDrivers(rideId: string, drivers: any[], index: number, passengerId: string) {
    if (index >= drivers.length) {
      this.notificationsService.sendToPassenger(passengerId, 'no_drivers_available', {
        rideId,
        message: 'No hay conductores disponibles en este momento.',
      });
      return;
    }

    const driver = drivers[index];
    const ride = await this.rideRepository.findById(rideId);

    if (!ride || ride.status !== RideStatus.SOLICITADO) {
      return;
    }

    const offerData = {
      rideId,
      origin: ride.origin,
      destination: ride.destination,
      originAddress: ride.originAddress,
      destinationAddress: ride.destinationAddress,
      estimatedDistance: ride.estimatedDistanceKm,
      estimatedDuration: ride.estimatedDurationMin,
      expiresAt: new Date(Date.now() + this.offerTimeoutSeconds * 1000).toISOString(),
    };

    await this.driverOfferRepository.create(rideId, driver.driver_id);

    this.notificationsService.sendRideOffer(driver.user_id, offerData);

    const timeout = setTimeout(async () => {
      await this.driverOfferRepository.expire(rideId, driver.driver_id);
      this.activeOffers.delete(`${rideId}:${driver.driver_id}`);

      const currentRide = await this.rideRepository.findById(rideId);
      if (currentRide && currentRide.status === RideStatus.SOLICITADO) {
        await this.sendOfferToDrivers(rideId, drivers, index + 1, passengerId);
      }
    }, this.offerTimeoutSeconds * 1000);

    this.activeOffers.set(`${rideId}:${driver.driver_id}`, timeout);
  }

  async rejectOffer(rideId: string, driverId: string): Promise<void> {
    const timeout = this.activeOffers.get(`${rideId}:${driverId}`);
    if (timeout) {
      clearTimeout(timeout);
      this.activeOffers.delete(`${rideId}:${driverId}`);
    }
    await this.driverOfferRepository.reject(rideId, driverId);
  }

  async acceptRide(rideId: string, driverId: string) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) {
      throw new NotFoundException(`Viaje ${rideId} no encontrado`);
    }
    if (ride.status !== RideStatus.SOLICITADO) {
      throw new BadRequestException(`El viaje no está en estado solicitado (actual: ${ride.status})`);
    }

    const hasOffer = await this.driverOfferRepository.hasPendingOffer(rideId, driverId);
    if (!hasOffer) {
      throw new BadRequestException('No hay oferta pendiente para este conductor');
    }

    const timeout = this.activeOffers.get(`${rideId}:${driverId}`);
    if (timeout) {
      clearTimeout(timeout);
      this.activeOffers.delete(`${rideId}:${driverId}`);
    }

    await this.rideRepository.acceptRideTransaction(rideId, driverId);

    const updatedRide = await this.rideRepository.findById(rideId);

    const driverUserId = await this.rideRepository.findDriverUserId(driverId);

    this.notificationsService.sendRideAccepted(ride.passengerId, {
      rideId,
      driverId,
      driverUserId: driverUserId,
      estimatedArrival: ride.estimatedDurationMin,
      originAddress: ride.originAddress,
      destinationAddress: ride.destinationAddress,
    });

    if (driverUserId) {
      this.notificationsService.sendStartNavigation(driverUserId, {
        rideId,
        routePolyline: ride.routePolyline,
        originAddress: ride.originAddress,
        destinationAddress: ride.destinationAddress,
      });
    }

    this.notificationsService.sendRideStatusChanged(ride.passengerId, {
      rideId,
      status: RideStatus.EN_CAMINO,
    });

    this.logger.log(`Ride ${rideId} accepted by driver ${driverId}`);

    return updatedRide;
  }

  async updateRideStatus(rideId: string, targetStatus: string): Promise<any> {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) {
      throw new NotFoundException(`Viaje ${rideId} no encontrado`);
    }

    const fromStatus = ride.status as RideStatus;
    const toStatus = targetStatus as RideStatus;

    if (!RideStateMachine.isValidTransition(fromStatus, toStatus)) {
      throw new BadRequestException(
        `Transición inválida de "${fromStatus}" a "${targetStatus}"`,
      );
    }

    const extraFields: { name: string; value: any }[] = [];
    if (toStatus === RideStatus.INICIADO) {
      extraFields.push({ name: 'started_at', value: new Date() });
    }
    if (toStatus === RideStatus.FINALIZADO) {
      extraFields.push({ name: 'finished_at', value: new Date() });
    }

    await this.rideRepository.updateStatus(rideId, toStatus, extraFields);

    if (toStatus === RideStatus.FINALIZADO && ride.driverId) {
      await this.rideRepository.setDriverAvailable(ride.driverId);
    }

    const passengerId = ride.passengerId;
    this.notificationsService.sendRideStatusChanged(passengerId, {
      rideId,
      status: targetStatus,
    });

    if (ride.driverId) {
      const driverUserId = await this.rideRepository.findDriverUserId(ride.driverId);
      if (driverUserId) {
        this.notificationsService.sendRideStatusChanged(driverUserId, {
          rideId,
          status: targetStatus,
        });
      }
    }

    this.logger.log(`Ride ${rideId} status changed: ${fromStatus} → ${targetStatus}`);

    return this.rideRepository.findById(rideId);
  }

  async cancelRide(
    rideId: string,
    userId: string,
    role: string,
    reasonCode?: string,
    notes?: string,
  ) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) {
      throw new NotFoundException(`Viaje ${rideId} no encontrado`);
    }

    const targetStatus =
      role === 'passenger' ? RideStatus.CANCELADO_CLIENTE : RideStatus.CANCELADO_CONDUCTOR;

    if (!RideStateMachine.isValidTransition(ride.status as RideStatus, targetStatus)) {
      throw new BadRequestException(
        `No se puede cancelar un viaje en estado "${ride.status}"`,
      );
    }

    await this.rideRepository.cancelRideTransaction(rideId, targetStatus, ride.driverId);

    await this.cancellationRepository.create(rideId, userId, reasonCode, notes);

    if (role === 'driver') {
      this.notificationsService.sendRideCancelled(ride.passengerId, {
        rideId,
        reason: reasonCode,
        message: 'El conductor canceló la solicitud. Buscando otro conductor...',
      });

      if ([RideStatus.EN_CAMINO, RideStatus.LLEGO].includes(ride.status as RideStatus)) {
        const origin = ride.origin;
        this.startMatchmaking(rideId, origin.lat, origin.lng, ride.passengerId);
      }
    } else {
      if (ride.driverId) {
        const driverUserId = await this.rideRepository.findDriverUserId(ride.driverId);
        if (driverUserId) {
          this.notificationsService.sendRideStatusChanged(driverUserId, {
            rideId,
            status: targetStatus,
          });
        }
      }

      this.notificationsService.sendRideStatusChanged(ride.passengerId, {
        rideId,
        status: targetStatus,
      });
    }

    this.logger.log(`Ride ${rideId} cancelled by ${role}`, { reasonCode });

    return { rideId, status: targetStatus, cancelledBy: role };
  }

  async getRideById(rideId: string) {
    const ride = await this.rideRepository.findById(rideId);
    if (!ride) {
      throw new NotFoundException(`Viaje ${rideId} no encontrado`);
    }
    return ride;
  }

  async getRideHistory(passengerId: string) {
    return this.rideRepository.findByPassengerId(passengerId);
  }
}
