import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { DriverStatus } from '../common/enums';
import { DriverLocationRepository } from '../geo/driver-location.repository';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    private driverLocationRepository: DriverLocationRepository,
  ) {}

  async findByUserId(userId: string): Promise<Driver | null> {
    return this.driverRepository.findOne({ where: { userId } });
  }

  async updateStatus(driverId: string, status: DriverStatus): Promise<void> {
    await this.driverRepository.update(driverId, { status, updatedAt: new Date() });
  }

  async updateLocation(driverId: string, lat: number, lng: number): Promise<void> {
    await this.driverLocationRepository.updateLocation(driverId, lat, lng);
  }

  async findByStatus(status: DriverStatus): Promise<Driver[]> {
    return this.driverRepository.find({ where: { status, isActive: true } });
  }

  async registerDriver(userId: string): Promise<Driver> {
    const existing = await this.findByUserId(userId);
    if (existing) {
      return existing;
    }
    const driver = this.driverRepository.create({ userId });
    return this.driverRepository.save(driver);
  }
}
