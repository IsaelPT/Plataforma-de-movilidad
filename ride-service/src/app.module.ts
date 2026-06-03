import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { GeoModule } from './geo/geo.module';
import { RoutingModule } from './routing/routing.module';
import { RideModule } from './ride/ride.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { CancellationModule } from './cancellation/cancellation.module';
import { SosModule } from './sos/sos.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DriverModule } from './driver/driver.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    HealthModule,
    GeoModule,
    RoutingModule,
    RideModule,
    SchedulingModule,
    CancellationModule,
    SosModule,
    NotificationsModule,
    DriverModule,
  ],
})
export class AppModule {}
