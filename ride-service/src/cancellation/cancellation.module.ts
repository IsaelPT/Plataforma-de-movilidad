import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CancellationService } from './cancellation.service';
import { CancellationController } from './cancellation.controller';
import { CancellationRepository } from './cancellation.repository';
import { Cancellation } from './entities/cancellation.entity';
import { CancellationReason } from './entities/cancellation-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cancellation, CancellationReason])],
  controllers: [CancellationController],
  providers: [CancellationService, CancellationRepository],
  exports: [CancellationService, CancellationRepository],
})
export class CancellationModule {}
