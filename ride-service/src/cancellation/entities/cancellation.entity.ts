import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('cancellations')
export class Cancellation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ride_id' })
  rideId: string;

  @Column({ name: 'cancelled_by' })
  cancelledBy: string;

  @Column({ name: 'reason_code', nullable: true })
  reasonCode: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'cancelled_at' })
  cancelledAt: Date;
}
