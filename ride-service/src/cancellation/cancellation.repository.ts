import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CancellationRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getReasons(forDriver?: boolean, forPassenger?: boolean): Promise<any[]> {
    let query = `SELECT code, label, for_driver, for_passenger FROM cancellation_reasons WHERE is_active = true`;
    const params: any[] = [];
    const conditions: string[] = [];

    if (forDriver) {
      conditions.push('for_driver = true');
    }
    if (forPassenger) {
      conditions.push('for_passenger = true');
    }

    if (conditions.length > 0) {
      query += ' AND (' + conditions.join(' OR ') + ')';
    }

    query += ' ORDER BY id ASC';
    return this.dataSource.query(query, params);
  }

  async create(rideId: string, cancelledBy: string, reasonCode?: string, notes?: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO cancellations (id, ride_id, cancelled_by, reason_code, notes, cancelled_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`,
      [rideId, cancelledBy, reasonCode || null, notes || null],
    );
  }
}
