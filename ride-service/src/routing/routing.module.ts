import { Module } from '@nestjs/common';
import { RoutingService } from './routing.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}
