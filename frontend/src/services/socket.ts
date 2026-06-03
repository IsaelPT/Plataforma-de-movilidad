import { io, Socket } from 'socket.io-client';
import type {
  RideOfferEvent,
  RideAcceptedEvent,
  RideStatusChangedEvent,
  SosAlertEvent,
  RideCancelledEvent,
  StartNavigationEvent,
  NoDriversAvailableEvent,
  ScheduledRideProcessingEvent,
  DriverLocation,
  UserRole,
} from '../types';

class RideSocket {
  private socket: Socket | null = null;

  connect(userId: string, role: UserRole) {
    if (this.socket?.connected) return;

    this.socket = io('/rides', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      query: { userId, role },
    });

    this.socket.on('connect', () => {
      console.log(`[WS] Connected as ${role} (${userId})`);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`[WS] Disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[WS] Connection error:', err.message);
    });

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  onRideOffer(cb: (data: RideOfferEvent) => void) {
    this.socket?.on('ride_offer', cb);
    return () => this.socket?.off('ride_offer', cb);
  }

  onRideAccepted(cb: (data: RideAcceptedEvent) => void) {
    this.socket?.on('ride_accepted', cb);
    return () => this.socket?.off('ride_accepted', cb);
  }

  onRideCancelled(cb: (data: RideCancelledEvent) => void) {
    this.socket?.on('ride_cancelled', cb);
    return () => this.socket?.off('ride_cancelled', cb);
  }

  onRideStatusChanged(cb: (data: RideStatusChangedEvent) => void) {
    this.socket?.on('ride_status_changed', cb);
    return () => this.socket?.off('ride_status_changed', cb);
  }

  onSosAlert(cb: (data: SosAlertEvent) => void) {
    this.socket?.on('sos_alert', cb);
    return () => this.socket?.off('sos_alert', cb);
  }

  onStartNavigation(cb: (data: StartNavigationEvent) => void) {
    this.socket?.on('start_navigation', cb);
    return () => this.socket?.off('start_navigation', cb);
  }

  onNoDriversAvailable(cb: (data: NoDriversAvailableEvent) => void) {
    this.socket?.on('no_drivers_available', cb);
    return () => this.socket?.off('no_drivers_available', cb);
  }

  onScheduledRideProcessing(cb: (data: ScheduledRideProcessingEvent) => void) {
    this.socket?.on('scheduled_ride_processing', cb);
    return () => this.socket?.off('scheduled_ride_processing', cb);
  }

  acceptRide(rideId: string, driverId: string) {
    this.socket?.emit('accept_ride', { rideId, driverId });
  }

  rejectRide(rideId: string, driverId: string) {
    this.socket?.emit('reject_ride', { rideId, driverId });
  }

  changeRideStatus(rideId: string, status: string) {
    this.socket?.emit('change_ride_status', { rideId, status });
  }

  cancelRide(data: {
    rideId: string;
    userId: string;
    role: string;
    reasonCode?: string;
    notes?: string;
  }) {
    this.socket?.emit('cancel_ride', data);
  }

  updateLocation(driverId: string, lat: number, lng: number) {
    this.socket?.emit('update_location', { driverId, lat, lng });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

class GeoLocationSocket {
  private socket: Socket | null = null;

  connect(userId: string, role: UserRole) {
    if (this.socket?.connected) return;

    this.socket = io('/geo', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      query: { userId, role },
    });

    this.socket.on('connect', () => {
      console.log(`[GeoWS] Connected as ${role} (${userId})`);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`[GeoWS] Disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[GeoWS] Connection error:', err.message);
    });

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  onDriverLocationUpdate(cb: (data: DriverLocation[]) => void) {
    this.socket?.on('driver_location_update', cb);
    return () => this.socket?.off('driver_location_update', cb);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const rideSocket = new RideSocket();
export const geoSocket = new GeoLocationSocket();
