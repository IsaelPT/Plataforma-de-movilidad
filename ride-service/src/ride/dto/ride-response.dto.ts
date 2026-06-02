export class RideResponseDto {
  id: string;
  passengerId: string;
  driverId: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  originAddress: string;
  destinationAddress: string;
  status: string;
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  totalCost: number;
  routePolyline: any;
  startedAt: Date;
  finishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
