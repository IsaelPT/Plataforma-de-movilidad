import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SchedulingRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(
    passengerId: string,
    originLng: number,
    originLat: number,
    destLng: number,
    destLat: number,
    scheduledDate: Date,
    searchAt: Date,
    originAddress?: string,
    destinationAddress?: string,
  ): Promise<string> {
    const id = uuidv4();

    await this.dataSource.query(
      `INSERT INTO scheduled_rides
         (id, passenger_id, origin_lon, origin_lat, destination_lon, destination_lat,
          origin_address, destination_address, scheduled_at, search_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'programado')`,
      [id, passengerId, originLng, originLat, destLng, destLat, originAddress || null, destinationAddress || null, scheduledDate, searchAt],
    );

    return id;
  }

  async findPendingSearches(limit = 10): Promise<any[]> {
    return this.dataSource.query(
      `SELECT * FROM scheduled_rides
       WHERE status = 'programado' AND search_at <= NOW()
       ORDER BY search_at ASC
       LIMIT $1`,
      [limit],
    );
  }

  async markAsSearching(id: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE scheduled_rides SET status = 'buscando', updated_at = NOW() WHERE id = $1`,
      [id],
    );
  }

  async markAsCompleted(id: string, rideId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE scheduled_rides SET status = 'completado', ride_id = $1, updated_at = NOW() WHERE id = $2`,
      [rideId, id],
    );
  }

  async cancel(id: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE scheduled_rides SET status = 'cancelado', updated_at = NOW() WHERE id = $1`,
      [id],
    );
  }
}
