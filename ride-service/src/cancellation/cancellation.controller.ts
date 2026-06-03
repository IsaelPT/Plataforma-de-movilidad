import { Controller, Get, Query } from '@nestjs/common';
import { CancellationService } from './cancellation.service';
import { CancellationReasonsQueryDto } from './dto/cancellation-reasons-query.dto';

@Controller('cancellation')
export class CancellationController {
  constructor(private readonly cancellationService: CancellationService) {}

  @Get('reasons')
  async getReasons(@Query() query: CancellationReasonsQueryDto) {
    return this.cancellationService.getReasons(query.role);
  }
}
