import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { SosService } from './sos.service';
import { RegisterContactDto } from './dto/register-contact.dto';
import { SosTriggerDto } from './dto/sos-trigger.dto';
import { ContactsQueryDto } from './dto/contacts-query.dto';

@Controller('sos')
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @Post('contacts')
  async registerContact(@Body() dto: RegisterContactDto) {
    return this.sosService.registerContact(dto.passengerId, dto.name, dto.phone);
  }

  @Get('contacts')
  async getContacts(@Query() query: ContactsQueryDto) {
    return this.sosService.getContacts(query.passengerId);
  }

  @Delete('contacts/:id')
  async deleteContact(@Param('id') id: string) {
    await this.sosService.deleteContact(id);
    return { success: true };
  }

  @Post('trigger')
  async triggerSOS(@Body() dto: SosTriggerDto) {
    return this.sosService.triggerSOS(dto.rideId, dto.passengerId, dto.lat, dto.lng);
  }

  @Get('alerts')
  async getAlerts(@Query('status') status?: string) {
    return this.sosService.getAlerts(status);
  }

  @Post('alerts/:id/resolve')
  async resolveAlert(@Param('id') id: string) {
    await this.sosService.resolveAlert(id);
    return { success: true };
  }
}
