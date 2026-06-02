import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SosService } from './sos.service';
import { SosController } from './sos.controller';
import { TrustedContact } from './entities/trusted-contact.entity';
import { SosAlert } from './entities/sos-alert.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { RideModule } from '../ride/ride.module';

@Module({
  imports: [TypeOrmModule.forFeature([TrustedContact, SosAlert]), NotificationsModule, RideModule],
  controllers: [SosController],
  providers: [SosService],
  exports: [SosService],
})
export class SosModule {}
