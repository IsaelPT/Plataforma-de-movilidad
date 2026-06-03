import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulingRepository } from './scheduling.repository';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);
  private readonly searchBeforeMinutes: number;

  constructor(
    private configService: ConfigService,
    private schedulingRepository: SchedulingRepository,
  ) {
    this.searchBeforeMinutes = this.configService.get<number>('ride.scheduledSearchBeforeMinutes') || 10;
  }

  async scheduleRide(
    passengerId: string,
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    scheduledAt: string,
    originAddress?: string,
    destinationAddress?: string,
  ) {
    const scheduledDate = new Date(scheduledAt);
    const minTime = new Date(Date.now() + 60 * 60 * 1000);

    if (scheduledDate < minTime) {
      throw new BadRequestException('La reserva debe ser con al menos 1 hora de anticipación');
    }

    const searchAt = new Date(scheduledDate.getTime() - this.searchBeforeMinutes * 60 * 1000);

    const id = await this.schedulingRepository.create(
      passengerId,
      originLng,
      originLat,
      destLng,
      destLat,
      scheduledDate,
      searchAt,
      originAddress,
      destinationAddress,
    );

    this.logger.log(`Ride scheduled: ${id} for ${scheduledDate.toISOString()}`);

    return { id, scheduledAt: scheduledDate, searchAt };
  }

  async getPendingSearches() {
    return this.schedulingRepository.findPendingSearches();
  }

  async markAsSearching(id: string) {
    await this.schedulingRepository.markAsSearching(id);
  }

  async markAsCompleted(id: string, rideId: string) {
    await this.schedulingRepository.markAsCompleted(id, rideId);
  }
}
