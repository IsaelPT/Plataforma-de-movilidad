import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DriverLocationRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findNearbyDrivers(lat: number, lng: number, radiusMeters: number): Promise<any[]> {
    return this.dataSource.query(
      `SELECT * FROM find_nearby_drivers($1, $2, $3)`,
      [lat, lng, radiusMeters],
    );
  }

  async updateLocation(driverId: string, lat: number, lng: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE drivers
       SET current_location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::GEOGRAPHY,
           last_location_update = NOW(),
           updated_at = NOW()
       WHERE id = $3`,
      [lng, lat, driverId],
    );
  }

  async getLocation(driverId: string): Promise<{ lat: number; lng: number } | null> {
    const result = await this.dataSource.query(
      `SELECT ST_X(current_location::GEOMETRY) as lng,
              ST_Y(current_location::GEOMETRY) as lat
       FROM drivers
       WHERE id = $1`,
      [driverId],
    );
    if (result.length > 0 && result[0].lat && result[0].lng) {
      return { lat: parseFloat(result[0].lat), lng: parseFloat(result[0].lng) };
    }
    return null;
  }

  async getAllAvailableDriversLocations(centerLat: number, centerLng: number, radiusMeters: number): Promise<any[]> {
    const result = await this.dataSource.query(
      `SELECT
         d.id as "driverId",
         d.user_id as "userId",
         ST_X(d.current_location::GEOMETRY) as lng,
         ST_Y(d.current_location::GEOMETRY) as lat
       FROM drivers d
       WHERE d.status = 'disponible'
         AND d.is_active = true
         AND ST_DWithin(
           d.current_location,
           ST_SetSRID(ST_MakePoint($1, $2), 4326)::GEOGRAPHY,
           $3
         )`,
      [centerLng, centerLat, radiusMeters],
    );
    return result.map((r: any) => ({
      driverId: r.driverId,
      userId: r.userId,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lng),
    }));
  }

  async getAllDriverLocations(): Promise<any[]> {
    const result = await this.dataSource.query(
      `SELECT
         d.id as "driverId",
         d.user_id as "userId",
         ST_X(d.current_location::GEOMETRY) as lng,
         ST_Y(d.current_location::GEOMETRY) as lat
       FROM drivers d
       WHERE d.status = 'disponible'
         AND d.is_active = true
         AND d.current_location IS NOT NULL`,
    );
    return result.map((r: any) => ({
      driverId: r.driverId,
      userId: r.userId,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lng),
    }));
  }
}
