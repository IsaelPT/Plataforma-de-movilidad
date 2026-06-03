import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DriverOfferRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(rideId: string, driverId: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO driver_offers (id, ride_id, driver_id, status, offered_at, expires_at)
       VALUES ($1, $2, $3, 'pendiente', NOW(), NOW() + INTERVAL '20 seconds')`,
      [uuidv4(), rideId, driverId],
    );
  }

  async accept(rideId: string, driverId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE driver_offers SET status = 'aceptada', responded_at = NOW()
       WHERE ride_id = $1 AND driver_id = $2 AND status = 'pendiente'
       RETURNING id`,
      [rideId, driverId],
    );
    return result.length > 0;
  }

  async reject(rideId: string, driverId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE driver_offers SET status = 'rechazada', responded_at = NOW()
       WHERE ride_id = $1 AND driver_id = $2 AND status = 'pendiente'`,
      [rideId, driverId],
    );
  }

  async expire(rideId: string, driverId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE driver_offers SET status = 'expirada', responded_at = NOW()
       WHERE ride_id = $1 AND driver_id = $2 AND status = 'pendiente'`,
      [rideId, driverId],
    );
  }

  async hasPendingOffer(rideId: string, driverId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT id FROM driver_offers
       WHERE ride_id = $1 AND driver_id = $2 AND status = 'pendiente'
       LIMIT 1`,
      [rideId, driverId],
    );
    return result.length > 0;
  }
}
