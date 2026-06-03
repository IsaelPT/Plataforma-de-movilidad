export type RideStatus =
  | 'solicitado'
  | 'en_camino'
  | 'llego'
  | 'iniciado'
  | 'finalizado'
  | 'cancelado_cliente'
  | 'cancelado_conductor';

export type DriverStatus = 'disponible' | 'ocupado' | 'offline';

export type UserRole = 'passenger' | 'driver' | 'admin';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Ride {
  id: string;
  passengerId: string;
  driverId?: string;
  driverUserId?: string;
  origin: LatLng;
  destination: LatLng;
  originAddress?: string;
  destinationAddress?: string;
  status: RideStatus;
  estimatedDistanceKm?: number;
  estimatedDurationMin?: number;
  totalCost?: number;
  routePolyline?: unknown;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverOffer {
  id: string;
  rideId: string;
  driverId: string;
  status: 'pendiente' | 'aceptada' | 'rechazada' | 'expirada';
  offeredAt: string;
  respondedAt?: string;
  expiresAt: string;
}

export interface Driver {
  id: string;
  userId: string;
  status: DriverStatus;
  isActive: boolean;
  currentLocation?: LatLng;
  lastLocationUpdate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverLocation {
  driverId: string;
  userId: string;
  lat: number;
  lng: number;
}

export interface ScheduledRide {
  id: string;
  passengerId: string;
  originLat: number;
  originLon: number;
  destinationLat: number;
  destinationLon: number;
  originAddress?: string;
  destinationAddress?: string;
  scheduledAt: string;
  status: 'programado' | 'buscando' | 'completado' | 'cancelado';
  rideId?: string;
  createdAt: string;
}

export interface CancellationReason {
  id: number;
  code: string;
  label: string;
  forDriver: boolean;
  forPassenger: boolean;
  isActive: boolean;
}

export interface TrustedContact {
  id: string;
  passengerId: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface SosAlert {
  id: string;
  rideId: string;
  passengerId: string;
  driverId?: string;
  locationLon: number;
  locationLat: number;
  status: 'activa' | 'resuelta';
  createdAt: string;
  resolvedAt?: string;
}

export interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  polyline: unknown;
  originAddress?: string;
  destinationAddress?: string;
}

export interface RideOfferEvent {
  rideId: string;
  origin: LatLng;
  destination: LatLng;
  originAddress?: string;
  destinationAddress?: string;
  estimatedDistance: number;
  estimatedDuration: number;
  expiresAt: string;
}

export interface RideAcceptedEvent {
  rideId: string;
  driverId: string;
  driverUserId: string;
  estimatedArrival: number;
  originAddress?: string;
  destinationAddress?: string;
}

export interface RideStatusChangedEvent {
  rideId: string;
  status: RideStatus;
}

export interface SosAlertEvent {
  alertId: string;
  rideId: string;
  passengerId: string;
  location: LatLng;
  timestamp: string;
  message: string;
}

export interface RideCancelledEvent {
  rideId: string;
  reason?: string;
  message?: string;
}

export interface StartNavigationEvent {
  rideId: string;
  routePolyline: unknown;
  originAddress?: string;
  destinationAddress?: string;
}

export interface NoDriversAvailableEvent {
  rideId: string;
  message: string;
}

export interface ScheduledRideProcessingEvent {
  scheduledRideId: string;
  status: string;
}

export interface GeocodingResult {
  displayName: string;
  lat: number;
  lng: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: 'client' | 'driver' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    photoUrl: string;
  };
  isVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: 'client' | 'driver';
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
