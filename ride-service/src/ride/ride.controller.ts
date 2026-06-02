import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { RideService } from './ride.service';
import { RequestRideDto } from './dto/request-ride.dto';
import { UpdateRideStatusDto } from './dto/update-ride-status.dto';
import { CancelRideDto } from './dto/cancel-ride.dto';
import { RideStatus } from '../common/enums';

@Controller('rides')
export class RideController {
  constructor(private readonly rideService: RideService) {}

  @Post('request')
  async requestRide(@Body() dto: RequestRideDto) {
    return this.rideService.requestRide(
      dto.passengerId,
      dto.originLat,
      dto.originLng,
      dto.destinationLat,
      dto.destinationLng,
      dto.originAddress,
      dto.destinationAddress,
    );
  }

  @Get(':id')
  async getRide(@Param('id') id: string) {
    return this.rideService.getRideById(id);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateRideStatusDto) {
    return this.rideService.updateRideStatus(id, dto.status as RideStatus);
  }

  @Post(':id/cancel')
  async cancelRide(@Param('id') id: string, @Body() dto: CancelRideDto) {
    return this.rideService.cancelRide(id, dto.userId, dto.role, dto.reasonCode, dto.notes);
  }

  @Get('history/:passengerId')
  async getHistory(@Param('passengerId') passengerId: string) {
    return this.rideService.getRideHistory(passengerId);
  }
}
