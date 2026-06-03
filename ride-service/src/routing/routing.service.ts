import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);
  private readonly orsApiUrl: string;

  constructor(private configService: ConfigService) {
    this.orsApiUrl = this.configService.get<string>('ors.apiUrl') || 'http://localhost:8082/ors';
  }

  async calculateRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
  ): Promise<{
    distanceKm: number;
    durationMin: number;
    polyline: any;
  }> {
    try {
      const response = await axios.post(
        `${this.orsApiUrl}/v2/directions/driving-car/geojson`,
        {
          coordinates: [
            [originLng, originLat],
            [destLng, destLat],
          ],
          format: 'geojson',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.configService.get<string>('ors.apiKey')
              ? `Bearer ${this.configService.get<string>('ors.apiKey')}`
              : '',
          },
        },
      );

      const feature = response.data.features[0];
      const properties = feature.properties;
      const segments = properties.segments[0];

      return {
        distanceKm: +(segments.distance / 1000).toFixed(2),
        durationMin: +(segments.duration / 60).toFixed(1),
        polyline: feature.geometry,
      };
    } catch (error) {
      this.logger.error(`ORS routing failed: ${error.message}`);
      // Fallback: straight-line estimation
      const distanceKm = this.haversineDistance(originLat, originLng, destLat, destLng);
      return {
        distanceKm: +distanceKm.toFixed(2),
        durationMin: +((distanceKm / 40) * 60).toFixed(1),
        polyline: {
          type: 'LineString',
          coordinates: [
            [originLng, originLat],
            [destLng, destLat],
          ],
        },
      };
    }
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
