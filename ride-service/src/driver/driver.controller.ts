import { Controller, Post, Patch, Get, Param, Body } from '@nestjs/common';
import { DriverService } from './driver.service';
import { RegisterDriverDto } from './dto/register-driver.dto';
import { UpdateDriverStatusDto } from './dto/update-driver-status.dto';

@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post('register')
  async register(@Body() dto: RegisterDriverDto) {
    return this.driverService.registerDriver(dto.userId);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateDriverStatusDto) {
    await this.driverService.updateStatus(id, dto.status);
    return { success: true };
  }

  @Get('by-user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.driverService.findByUserId(userId);
  }
}
