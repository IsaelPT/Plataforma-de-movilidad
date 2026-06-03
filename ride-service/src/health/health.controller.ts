import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    private configService: ConfigService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  async check() {
    let dbStatus = 'ok';
    let dbMessage: string | undefined;

    try {
      await this.dataSource.query('SELECT 1');
    } catch (error) {
      dbStatus = 'error';
      dbMessage = error.message;
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      service: 'ride-service',
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('app.environment'),
      database: {
        status: dbStatus,
        message: dbMessage,
      },
    };
  }
}
