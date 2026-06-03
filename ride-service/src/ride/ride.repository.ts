import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RideStatus, DriverStatus } from '../common/enums';

@Injectable()
export class RideRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(
    id: string,
    passengerId: string,
    originLng: number,
    originLat: number,
    destLng: number,
    destLat: number,
    originAddress: string | null,
    destinationAddress: string | null,
    distanceKm: number,
    durationMin: number,
    polyline: any,
  ): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO rides (id, passenger_id, origin, destination, origin_address, destination_address,
                          status, estimated_distance_km, estimated_duration_min, route_polyline)
       VALUES ($1, $2,
               ST_SetSRID(ST_MakePoint($3, $4), 4326)::GEOGRAPHY,
               ST_SetSRID(ST_MakePoint($5, $6), 4326)::GEOGRAPHY,
               $7, $8,
               $12, $9, $10, $11)`,
      [id, passengerId, originLng, originLat, destLng, destLat, originAddress, destinationAddress, distanceKm, durationMin, JSON.stringify(polyline), RideStatus.SOLICITADO],
    );
  }

  async findById(rideId: string): Promise<any | null> {
    const result = await this.dataSource.query(
      `SELECT
         id, passenger_id as "passengerId", driver_id as "driverId",
         ST_X(origin::GEOMETRY) as "originLng",
         ST_Y(origin::GEOMETRY) as "originLat",
         ST_X(destination::GEOMETRY) as "destLng",
         ST_Y(destination::GEOMETRY) as "destLat",
         origin_address as "originAddress",
         destination_address as "destinationAddress",
         status, estimated_distance_km as "estimatedDistanceKm",
         estimated_duration_min as "estimatedDurationMin",
         total_cost as "totalCost",
         route_polyline as "routePolyline",
         started_at as "startedAt", finished_at as "finishedAt",
         created_at as "createdAt", updated_at as "updatedAt"
       FROM rides WHERE id = $1`,
      [rideId],
    );

    if (result.length === 0) return null;

    const r = result[0];
    return {
      ...r,
      origin: { lat: parseFloat(r.originLat), lng: parseFloat(r.originLng) },
      destination: { lat: parseFloat(r.destLat), lng: parseFloat(r.destLng) },
      routePolyline: typeof r.routePolyline === 'string' ? JSON.parse(r.routePolyline) : r.routePolyline,
    };
  }

  async findByPassengerId(passengerId: string): Promise<any[]> {
    const result = await this.dataSource.query(
      `SELECT
         id, passenger_id as "passengerId", driver_id as "driverId",
         ST_X(origin::GEOMETRY) as "originLng",
         ST_Y(origin::GEOMETRY) as "originLat",
         ST_X(destination::GEOMETRY) as "destLng",
         ST_Y(destination::GEOMETRY) as "destLat",
         origin_address as "originAddress",
         destination_address as "destinationAddress",
         status, estimated_distance_km as "estimatedDistanceKm",
         estimated_duration_min as "estimatedDurationMin",
         total_cost as "totalCost",
         started_at as "startedAt", finished_at as "finishedAt",
         created_at as "createdAt", updated_at as "updatedAt"
       FROM rides
       WHERE passenger_id = $1
       ORDER BY created_at DESC`,
      [passengerId],
    );

    return result.map((r: any) => ({
      ...r,
      origin: { lat: parseFloat(r.originLat), lng: parseFloat(r.originLng) },
      destination: { lat: parseFloat(r.destLat), lng: parseFloat(r.destLng) },
    }));
  }

  async updateStatus(rideId: string, status: RideStatus, extraFields?: { name: string; value: any }[]): Promise<void> {
    const fields = ['status = $1', 'updated_at = NOW()'];
    const params: any[] = [status, rideId];

    if (extraFields) {
      extraFields.forEach((field, i) => {
        fields.push(`${field.name} = $${i + 3}`);
        params.push(field.value);
      });
    }

    await this.dataSource.query(
      `UPDATE rides SET ${fields.join(', ')} WHERE id = $2`,
      params,
    );
  }

  async acceptRideTransaction(rideId: string, driverId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.query(
        `UPDATE driver_offers SET status = 'aceptada', responded_at = NOW()
         WHERE ride_id = $1 AND driver_id = $2`,
        [rideId, driverId],
      );
      await queryRunner.manager.query(
        `UPDATE drivers SET status = $1, updated_at = NOW() WHERE id = $2`,
        [DriverStatus.OCUPADO, driverId],
      );
      await queryRunner.manager.query(
        `UPDATE rides SET driver_id = $1, status = $2, updated_at = NOW()
         WHERE id = $3`,
        [driverId, RideStatus.EN_CAMINO, rideId],
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelRideTransaction(rideId: string, targetStatus: RideStatus, driverId: string | null): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.query(
        `UPDATE rides SET status = $1, updated_at = NOW() WHERE id = $2`,
        [targetStatus, rideId],
      );
      if (driverId) {
        await queryRunner.manager.query(
          `UPDATE drivers SET status = $1, updated_at = NOW() WHERE id = $2`,
          [DriverStatus.DISPONIBLE, driverId],
        );
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async setDriverAvailable(driverId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE drivers SET status = $1, updated_at = NOW() WHERE id = $2`,
      [DriverStatus.DISPONIBLE, driverId],
    );
  }

  async findDriverUserId(driverId: string): Promise<string | null> {
    const result = await this.dataSource.query(
      `SELECT user_id FROM drivers WHERE id = $1`,
      [driverId],
    );
    return result.length > 0 ? result[0].user_id : null;
  }

  async assignDriver(rideId: string, driverId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE rides SET driver_id = $1, status = $2, updated_at = NOW() WHERE id = $3`,
      [driverId, RideStatus.EN_CAMINO, rideId],
    );
  }

  async exists(rideId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT 1 FROM rides WHERE id = $1 LIMIT 1`,
      [rideId],
    );
    return result.length > 0;
  }

  async getDriverId(rideId: string): Promise<string | null> {
    const result = await this.dataSource.query(
      `SELECT driver_id FROM rides WHERE id = $1`,
      [rideId],
    );
    return result.length > 0 ? result[0].driver_id : null;
  }
}
