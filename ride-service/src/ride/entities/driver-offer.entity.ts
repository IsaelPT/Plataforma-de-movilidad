import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('driver_offers')
@Index(['rideId', 'driverId'])
export class DriverOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ride_id' })
  rideId: string;

  @Column({ name: 'driver_id' })
  driverId: string;

  @Column({ default: 'pendiente' })
  status: string;

  @CreateDateColumn({ name: 'offered_at' })
  offeredAt: Date;

  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;
}
