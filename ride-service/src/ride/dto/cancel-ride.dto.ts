import { IsString, IsOptional, IsIn } from 'class-validator';

export class CancelRideDto {
  @IsString()
  userId: string;

  @IsString()
  @IsIn(['driver', 'passenger'])
  role: string;

  @IsOptional()
  @IsString()
  reasonCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
