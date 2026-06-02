import { Controller, Post, Body } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { ScheduleRideDto } from './dto/schedule-ride.dto';

@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('scheduled')
  async scheduleRide(@Body() dto: ScheduleRideDto) {
    return this.schedulingService.scheduleRide(
      dto.passengerId,
      dto.originLat,
      dto.originLng,
      dto.destinationLat,
      dto.destinationLng,
      dto.scheduledAt,
      dto.originAddress,
      dto.destinationAddress,
    );
  }
}
