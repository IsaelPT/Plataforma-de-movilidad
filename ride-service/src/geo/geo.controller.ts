import { Controller, Get, Query } from '@nestjs/common';
import { GeoService } from './geo.service';
import { NearbyDriversQueryDto } from './dto/nearby-drivers-query.dto';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('nearby-drivers')
  async getNearbyDrivers(@Query() query: NearbyDriversQueryDto) {
    return this.geoService.findNearbyDrivers(query.lat, query.lng, query.radius);
  }
}
