import { Module, forwardRef } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { GeoModule } from '../geo/geo.module';

@Module({
  imports: [TypeOrmModule.forFeature([Driver]), forwardRef(() => GeoModule)],
  controllers: [DriverController],
  providers: [DriverService],
  exports: [DriverService],
})
export class DriverModule {}
