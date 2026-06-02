import { IsString, IsIn } from 'class-validator';
import { RideStatus } from '../../common/enums';

export class UpdateRideStatusDto {
  @IsString()
  rideId: string;

  @IsString()
  @IsIn([
    RideStatus.EN_CAMINO,
    RideStatus.LLEGO,
    RideStatus.INICIADO,
    RideStatus.FINALIZADO,
  ])
  status: RideStatus;
}
