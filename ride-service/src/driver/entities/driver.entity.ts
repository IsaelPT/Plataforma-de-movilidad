import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { DriverStatus } from '../../common/enums';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ default: DriverStatus.DISPONIBLE })
  status: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'current_location', type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  currentLocation: any;

  @Column({ name: 'last_location_update', type: 'timestamptz', nullable: true })
  lastLocationUpdate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
