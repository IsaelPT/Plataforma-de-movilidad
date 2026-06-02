import { IsString } from 'class-validator';

export class AcceptRideDto {
  @IsString()
  rideId: string;

  @IsString()
  driverId: string;
}
