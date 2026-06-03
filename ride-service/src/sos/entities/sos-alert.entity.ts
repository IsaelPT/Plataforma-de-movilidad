import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('sos_alerts')
@Index(['status'])
export class SosAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ride_id' })
  rideId: string;

  @Column({ name: 'passenger_id' })
  passengerId: string;

  @Column({ name: 'driver_id', nullable: true })
  driverId: string;

  @Column({ name: 'location_lon', type: 'decimal', precision: 10, scale: 7 })
  locationLon: number;

  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7 })
  locationLat: number;

  @Column({ default: 'activa' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date;
}
