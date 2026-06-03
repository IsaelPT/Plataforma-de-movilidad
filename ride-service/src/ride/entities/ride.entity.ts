import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { RideStatus } from '../../common/enums';

@Entity('rides')
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'passenger_id' })
  @Index()
  passengerId: string;

  @Column({ name: 'driver_id', nullable: true })
  driverId: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  origin: any;

  @Column({ name: 'origin_address', nullable: true })
  originAddress: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  destination: any;

  @Column({ name: 'destination_address', nullable: true })
  destinationAddress: string;

  @Column({ default: RideStatus.SOLICITADO })
  @Index()
  status: string;

  @Column({ name: 'estimated_distance_km', type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedDistanceKm: number;

  @Column({ name: 'estimated_duration_min', type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedDurationMin: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost: number;

  @Column({ name: 'route_polyline', type: 'jsonb', nullable: true })
  routePolyline: any;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
