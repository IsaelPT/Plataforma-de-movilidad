import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrustedContact } from './entities/trusted-contact.entity';
import { SosAlert } from './entities/sos-alert.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { RideRepository } from '../ride/ride.repository';
import { RideStatus } from '../common/enums';

@Injectable()
export class SosService {
  private readonly logger = new Logger(SosService.name);
  private readonly MAX_CONTACTS = 3;
  private readonly PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

  constructor(
    @InjectRepository(TrustedContact)
    private contactRepository: Repository<TrustedContact>,
    @InjectRepository(SosAlert)
    private alertRepository: Repository<SosAlert>,
    private rideRepository: RideRepository,
    private notificationsService: NotificationsService,
  ) {}

  async registerContact(passengerId: string, name: string, phone: string): Promise<TrustedContact> {
    if (!this.PHONE_REGEX.test(phone)) {
      throw new BadRequestException('Formato de teléfono inválido. Debe ser formato internacional (ej. +1234567890)');
    }

    const count = await this.contactRepository.count({ where: { passengerId } });
    if (count >= this.MAX_CONTACTS) {
      throw new BadRequestException(`Máximo ${this.MAX_CONTACTS} contactos de confianza permitidos`);
    }

    const contact = this.contactRepository.create({ passengerId, name, phone });
    return this.contactRepository.save(contact);
  }

  async getContacts(passengerId: string): Promise<TrustedContact[]> {
    return this.contactRepository.find({ where: { passengerId } });
  }

  async deleteContact(contactId: string): Promise<void> {
    const result = await this.contactRepository.delete(contactId);
    if (result.affected === 0) {
      throw new NotFoundException('Contacto no encontrado');
    }
  }

  async triggerSOS(
    rideId: string,
    passengerId: string,
    lat: number,
    lng: number,
  ): Promise<SosAlert> {
    const ride = await this.rideRepository.findById(rideId);

    if (!ride) {
      throw new NotFoundException('Viaje no encontrado');
    }

    if (ride.status !== RideStatus.INICIADO) {
      throw new BadRequestException('SOS solo disponible durante viajes iniciados');
    }

    const alert = this.alertRepository.create({
      rideId,
      passengerId,
      driverId: ride.driverId,
      locationLat: lat,
      locationLon: lng,
    });
    const savedAlert = await this.alertRepository.save(alert);

    const contacts = await this.getContacts(passengerId);
    for (const contact of contacts) {
      this.logger.log(`SOS alert would send SMS to ${contact.phone} for ${contact.name}`);
      // In production: send SMS/twilio or push notification
    }

    this.notificationsService.sendSOSAlert({
      alertId: savedAlert.id,
      rideId,
      passengerId,
      location: { lat, lng },
      timestamp: savedAlert.createdAt,
      message: 'ALERTA SOS - Pasajero requiere asistencia inmediata',
    });

    this.logger.warn(`SOS triggered for ride ${rideId} by passenger ${passengerId}`);

    return savedAlert;
  }

  async getAlerts(status?: string): Promise<SosAlert[]> {
    if (status) {
      return this.alertRepository.find({ where: { status }, order: { createdAt: 'DESC' } });
    }
    return this.alertRepository.find({ order: { createdAt: 'DESC' } });
  }

  async resolveAlert(alertId: string): Promise<void> {
    await this.alertRepository.update(alertId, {
      status: 'resuelta',
      resolvedAt: new Date(),
    });
  }
}
