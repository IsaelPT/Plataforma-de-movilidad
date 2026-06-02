import { Injectable } from '@nestjs/common';
import { CancellationRepository } from './cancellation.repository';

@Injectable()
export class CancellationService {
  constructor(private cancellationRepository: CancellationRepository) {}

  async getReasons(forRole?: 'driver' | 'passenger'): Promise<any[]> {
    return this.cancellationRepository.getReasons(
      forRole === 'driver',
      forRole === 'passenger',
    );
  }
}
