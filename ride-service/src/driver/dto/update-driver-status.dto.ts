import { IsEnum } from 'class-validator';
import { DriverStatus } from '../../common/enums';

export class UpdateDriverStatusDto {
  @IsEnum(DriverStatus)
  status: DriverStatus;
}
