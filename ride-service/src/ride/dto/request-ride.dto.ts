import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class RequestRideDto {
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

  @IsOptional()
  @IsString()
  originAddress?: string;

  @IsOptional()
  @IsString()
  destinationAddress?: string;
}
