import { IsString, IsNumber, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class ScheduleRideDto {
  @IsString()
  passengerId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  originLat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  originLng: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  destinationLat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  destinationLng: number;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  originAddress?: string;

  @IsOptional()
  @IsString()
  destinationAddress?: string;
}
