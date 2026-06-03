import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('scheduled_rides')
export class ScheduledRide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'passenger_id' })
  passengerId: string;

  @Column({ name: 'origin_lon', type: 'decimal', precision: 10, scale: 7 })
  originLon: number;

  @Column({ name: 'origin_lat', type: 'decimal', precision: 10, scale: 7 })
  originLat: number;

  @Column({ name: 'destination_lon', type: 'decimal', precision: 10, scale: 7 })
  destinationLon: number;

  @Column({ name: 'destination_lat', type: 'decimal', precision: 10, scale: 7 })
  destinationLat: number;

  @Column({ name: 'origin_address', nullable: true })
  originAddress: string;

  @Column({ name: 'destination_address', nullable: true })
  destinationAddress: string;

  @Column({ name: 'scheduled_at', type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ name: 'search_at', type: 'timestamptz' })
  @Index()
  searchAt: Date;

  @Column({ default: 'programado' })
  status: string;

  @Column({ name: 'ride_id', nullable: true })
  rideId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
