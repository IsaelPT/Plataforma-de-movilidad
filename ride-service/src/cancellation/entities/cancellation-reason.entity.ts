import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('cancellation_reasons')
export class CancellationReason {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  label: string;

  @Column({ name: 'for_driver', default: true })
  forDriver: boolean;

  @Column({ name: 'for_passenger', default: true })
  forPassenger: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
