import { Module, forwardRef } from '@nestjs/common';
import { RideModule } from '../ride/ride.module';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [forwardRef(() => RideModule)],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
