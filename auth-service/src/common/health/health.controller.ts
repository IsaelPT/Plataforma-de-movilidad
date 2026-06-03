import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check() {
    const mongoStatus = this.connection.readyState === 1 ? 'up' : 'down';
    const status = mongoStatus === 'up' ? 'ok' : 'error';
    return {
      status,
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
      },
    };
  }
}